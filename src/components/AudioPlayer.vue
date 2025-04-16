<template>
  <div class="audio-player" v-if="currentSong">
    <div class="player-info">
      <img :src="getImageUrl(currentSong)" :alt="currentSong.name" class="song-image" />
      <div class="song-details">
        <h3 class="song-title">{{ currentSong.name }}</h3>
        <p class="song-artist">{{ getPrimaryArtists(currentSong) }}</p>
      </div>
    </div>

    <div class="player-controls">
      <button class="control-btn" @click="$emit('previous')" title="Previous">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-btn play-btn" @click="togglePlay" title="Play/Pause">
        <svg v-if="isPlaying" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5.14v14l11-7-11-7z" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-btn" @click="$emit('next')" title="Next">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-btn" @click="downloadSong" title="Download">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <div class="player-progress">
      <span class="time">{{ formatTime(currentTime) }}</span>
      <input
        type="range"
        v-model="currentTime"
        :max="duration"
        @input="seek"
        class="progress-bar"
      />
      <span class="time">{{ formatTime(duration) }}</span>
    </div>

    <div class="queue-info" v-if="queue.length > 1">
      <span>{{ currentSongPosition }} of {{ queue.length }} in queue</span>
      <button class="clear-btn" @click="$emit('clear-queue')" title="Clear queue">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import type { Song } from '../services/musicService';

const props = defineProps<{
  currentSong: Song | null;
  queue: Song[];
}>();

const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'previous'): void;
  (e: 'clear-queue'): void;
}>();

const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const currentSongPosition = computed(() => {
  if (!props.currentSong) return 0;
  return props.queue.findIndex(song => song.id === props.currentSong?.id) + 1;
});

const getImageUrl = (song: Song) => {
  const image = song.image.find(img => img.quality === '500x500') || song.image[0];
  return image?.url || '';
};

const getPrimaryArtists = (song: Song) => {
  return song.artists.primary.map(artist => artist.name).join(', ');
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const togglePlay = () => {
  if (!audio.value) return;
  
  if (isPlaying.value) {
    audio.value.pause();
  } else {
    audio.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const seek = () => {
  if (!audio.value) return;
  audio.value.currentTime = currentTime.value;
};

const handleTimeUpdate = () => {
  if (!audio.value) return;
  currentTime.value = audio.value.currentTime;
};

const handleLoadedMetadata = () => {
  if (!audio.value) return;
  duration.value = audio.value.duration;
};

const handleEnded = () => {
  currentTime.value = 0;
  emit('next');
};

const downloadSong = async () => {
  if (!props.currentSong) return;
  
  // Get the highest quality audio URL and ensure it uses HTTPS
  const highestQualityUrl = props.currentSong.downloadUrl.find(url => url.quality === '320kbps')?.url || 
                           props.currentSong.downloadUrl[props.currentSong.downloadUrl.length - 1]?.url;
  
  if (!highestQualityUrl) return;

  // Replace http:// with https:// in the URL
  const secureUrl = highestQualityUrl.replace('http://', 'https://');

  try {
    // Fetch the audio file using the secure URL
    const response = await fetch(secureUrl);
    if (!response.ok) throw new Error('Failed to download song');
    
    // Get the audio data as a blob
    const blob = await response.blob();
    
    // Create a URL for the blob
    const blobUrl = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Set the download filename
    const fileName = `${props.currentSong.name} - ${getPrimaryArtists(props.currentSong)}.mp3`;
    link.download = fileName;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading song:', error);
    // You could add a user notification here if desired
  }
};

const setupAudio = () => {
  if (!props.currentSong) return;
  
  if (audio.value) {
    audio.value.pause();
    audio.value.removeEventListener('timeupdate', handleTimeUpdate);
    audio.value.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.value.removeEventListener('ended', handleEnded);
  }

  // Find the highest quality audio URL (320kbps)
  const highestQualityUrl = props.currentSong.downloadUrl.find(url => url.quality === '320kbps')?.url || 
                           props.currentSong.downloadUrl[props.currentSong.downloadUrl.length - 1]?.url;

  audio.value = new Audio(highestQualityUrl);
  audio.value.addEventListener('timeupdate', handleTimeUpdate);
  audio.value.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.value.addEventListener('ended', handleEnded);

  // Always play the next song automatically
  audio.value.play();
  isPlaying.value = true;
};

watch(() => props.currentSong, () => {
  setupAudio();
});

onMounted(() => {
  setupAudio();
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.removeEventListener('timeupdate', handleTimeUpdate);
    audio.value.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.value.removeEventListener('ended', handleEnded);
  }
});
</script>

<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.song-image {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius);
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.control-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed) ease;
}

.control-btn:hover {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.play-btn {
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
}

.play-btn:hover {
  background-color: var(--primary-color);
  opacity: 0.9;
}

.control-btn svg {
  width: 24px;
  height: 24px;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: var(--text-secondary);
  border-radius: 2px;
  outline: none;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.time {
  font-size: 0.875rem;
  color: var(--text-secondary);
  min-width: 3rem;
  text-align: center;
}

.queue-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed) ease;
}

.clear-btn:hover {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}
</style> 