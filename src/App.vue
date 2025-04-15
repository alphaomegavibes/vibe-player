<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">Vibe Player</h1>
      <SearchBar @search="handleSearch" />
    </header>
    <main class="app-main">
      <MusicList
        :songs="songs"
        :current-song="currentSong"
        @play="handlePlay"
        @add-to-queue="handleAddToQueue"
      />
    </main>
    <footer class="app-footer">
      <AudioPlayer
        :current-song="currentSong"
        :queue="queue"
        @next="handleNext"
        @previous="handlePrevious"
        @clear-queue="clearQueue"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SearchBar from './components/SearchBar.vue';
import MusicList from './components/MusicList.vue';
import AudioPlayer from './components/AudioPlayer.vue';
import { searchSongs } from './services/musicService';
import type { Song } from './services/musicService';

const songs = ref<Song[]>([]);
const currentSong = ref<Song | null>(null);
const queue = ref<Song[]>([]);

const handleSearch = async (query: string) => {
  try {
    const results = await searchSongs(query);
    songs.value = results;
  } catch (error) {
    console.error('Error searching songs:', error);
  }
};

const handlePlay = (song: Song) => {
  currentSong.value = song;
  // If the song is not in the queue, add it
  if (!queue.value.some(s => s.id === song.id)) {
    queue.value.push(song);
  }
};

const handleAddToQueue = (song: Song) => {
  // Don't add duplicate songs to the queue
  if (!queue.value.some(s => s.id === song.id)) {
    queue.value.push(song);
  }
};

const handleNext = () => {
  if (queue.value.length > 0) {
    const currentIndex = queue.value.findIndex(song => song.id === currentSong.value?.id);
    const nextIndex = (currentIndex + 1) % queue.value.length;
    currentSong.value = queue.value[nextIndex];
  }
};

const handlePrevious = () => {
  if (queue.value.length > 0) {
    const currentIndex = queue.value.findIndex(song => song.id === currentSong.value?.id);
    const previousIndex = (currentIndex - 1 + queue.value.length) % queue.value.length;
    currentSong.value = queue.value[previousIndex];
  }
};

const clearQueue = () => {
  queue.value = [];
  if (currentSong.value) {
    queue.value.push(currentSong.value);
  }
};
</script>

<style>
:root {
  --primary-color: #1db954;
  --background-color: #121212;
  --surface-color: #181818;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-radius: 8px;
  --transition-speed: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--surface-color);
  padding: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, var(--primary-color), #1ed760);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: var(--surface-color);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--surface-color);
}

::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style> 