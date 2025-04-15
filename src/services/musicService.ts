import axios from 'axios';

const BASE_URL = 'https://saavn.dev/api';

export interface Song {
  id: string;
  name: string;
  type: string;
  year: string | null;
  duration: number | null;
  label: string | null;
  language: string;
  url: string;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  image: Image[];
  downloadUrl: DownloadUrl[];
}

interface Artist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: Image[];
  url: string;
}

interface Image {
  quality: string;
  url: string;
}

interface DownloadUrl {
  quality: string;
  url: string;
}

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search/songs`, {
      params: { query }
    });
    return response.data.data.results;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
}; 