<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
      </svg>
      <input
        type="text"
        v-model="searchQuery"
        @input="handleInput"
        placeholder="Search for songs, artists, or albums..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-button">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
const emit = defineEmits<{
  (e: 'search', query: string): void
}>();

const handleInput = () => {
  emit('search', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};
</script>

<style scoped>
.search-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;
  transition: all var(--transition-speed) ease;
  border: 1px solid transparent;
}

.search-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  padding: 0.5rem 0;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-speed) ease;
}

.clear-button:hover {
  color: var(--text-primary);
}

.clear-button svg {
  width: 20px;
  height: 20px;
}
</style> 