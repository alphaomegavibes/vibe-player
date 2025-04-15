<template>
  <div class="music-list">
    <div v-if="songs.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3C10.9 3 9.91 3.29 9 3.78C7.48 2.23 5.42 1.5 3 1.5C2.45 1.5 2 1.95 2 2.5C2 3.05 2.45 3.5 3 3.5C5.05 3.5 6.8 4.11 8.1 5.1C7.36 5.46 6.7 5.95 6.15 6.55L12 10.75L17.85 6.55C17.3 5.95 16.64 5.46 15.9 5.1C17.2 4.11 18.95 3.5 21 3.5C21.55 3.5 22 3.05 22 2.5C22 1.95 21.55 1.5 21 1.5C18.58 1.5 16.52 2.23 15 3.78C14.09 3.29 13.1 3 12 3ZM12 12.5L6.15 8.3C5.5 7.75 4.75 7.3 3.9 7C3.95 6.99 4 6.99 4.05 6.99C5.42 6.99 6.67 7.44 7.65 8.2L12 11.5L16.35 8.2C17.33 7.44 18.58 6.99 19.95 6.99C20 6.99 20.05 6.99 20.1 7C19.25 7.3 18.5 7.75 17.85 8.3L12 12.5Z" fill="currentColor"/>
      </svg>
      <p>No songs found</p>
    </div>
    <div v-else class="music-grid">
      <div
        v-for="song in songs"
        :key="song.id"
        class="music-card"
        :class="{ 'is-playing': song.id === currentSong?.id }"
      >
        <div class="card-image" @click="$emit('play', song)">
          <img :src="getImageUrl(song)" :alt="song.name" />
          <div class="play-overlay">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        <div class="card-content">
          <h3 class="song-title">{{ song.name }}</h3>
          <p class="song-artist">{{ getPrimaryArtists(song) }}</p>
          <div class="card-actions">
            <button 
              class="queue-btn" 
              @click.stop="$emit('add-to-queue', song)" 
              title="Add to queue"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              class="download-btn" 
              @click.stop="downloadSong(song)" 
              title="Download"
              :disabled="downloadingSongs[song.id]"
            >
              <svg v-if="!downloadingSongs[song.id]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
              </svg>
              <svg v-else class="loading-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="currentColor" fill-opacity="0.2"/>
                <path d="M12 2C14.5013 2 16.8911 2.99353 18.6685 4.76184C20.4459 6.53016 21.5 8.88171 21.5 11.3333C21.5 11.7015 21.2015 12 20.8333 12C20.4652 12 20.1667 11.7015 20.1667 11.3333C20.1667 9.18828 19.3512 7.13047 17.8512 5.63047C16.3512 4.13047 14.2934 3.33333 12.1667 3.33333C11.7985 3.33333 11.5 3.03486 11.5 2.66667C11.5 2.29848 11.7985 2 12.1667 2H12Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div v-if="downloadingSongs[song.id]" class="download-progress">
            <div class="progress-bar" :style="{ width: `${downloadProgress[song.id] || 0}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Song } from '../types';
import { ref } from 'vue';

defineProps<{
  songs: Song[];
  currentSong: Song | null;
}>();

defineEmits<{
  (e: 'play', song: Song): void;
  (e: 'add-to-queue', song: Song): void;
}>();

const downloadingSongs = ref<Record<string, boolean>>({});
const downloadProgress = ref<Record<string, number>>({});

const getImageUrl = (song: Song) => {
  const image = song.image.find(img => img.quality === '500x500') || song.image[0];
  return image?.url || '';
};

const getPrimaryArtists = (song: Song) => {
  return song.artists.primary.map(artist => artist.name).join(', ');
};

const downloadSong = async (song: Song) => {
  if (downloadingSongs.value[song.id]) return;
  
  // Get the highest quality audio URL
  const highestQualityUrl = song.downloadUrl.find(url => url.quality === '320kbps')?.url || 
                           song.downloadUrl[song.downloadUrl.length - 1]?.url;
  
  if (!highestQualityUrl) return;

  try {
    downloadingSongs.value[song.id] = true;
    downloadProgress.value[song.id] = 0;

    // Fetch the audio file
    const response = await fetch(highestQualityUrl);
    if (!response.ok) throw new Error('Failed to download song');
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength) : 0;
    let loaded = 0;

    // Get the audio data as a blob with progress tracking
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to read response body');

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (total) {
        downloadProgress.value[song.id] = Math.round((loaded / total) * 100);
      }
    }

    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // Set the download filename
    const fileName = `${song.name} - ${getPrimaryArtists(song)}.mp3`;
    link.download = fileName;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading song:', error);
  } finally {
    downloadingSongs.value[song.id] = false;
    delete downloadProgress.value[song.id];
  }
};
</script>

<style scoped>
.music-list {
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--text-secondary);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.music-card {
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
  position: relative;
}

.music-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.music-card.is-playing {
  border: 2px solid var(--primary-color);
}

.card-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-speed) ease;
}

.music-card:hover .card-image img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
}

.music-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay svg {
  width: 48px;
  height: 48px;
  color: white;
}

.card-content {
  padding: 1rem;
  position: relative;
}

.song-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
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

.card-actions {
  display: flex;
  gap: 0.5rem;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
}

.music-card:hover .card-actions {
  opacity: 1;
}

.queue-btn,
.download-btn {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed) ease;
}

.queue-btn:hover,
.download-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.queue-btn svg,
.download-btn svg {
  width: 16px;
  height: 16px;
}

.download-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.1s linear;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 