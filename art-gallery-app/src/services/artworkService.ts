import axios from 'axios';
import type { Artwork, PaginationParams } from '../types/artwork';

const API_BASE_URL = 'https://api.artic.edu/api/v1/artworks';

export const fetchArtworks = async (params: PaginationParams): Promise<{ data: Artwork[]; totalRecords: number }> => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params: {
        page: params.page,
        limit: params.size
      }
    });

    // Define a type for the expected API artwork item structure
    type ApiArtworkItem = {
      id: number;
      title?: string;
      place_of_origin?: string;
      artist_display?: string;
      inscriptions?: string;
      date_start?: number;
      date_end?: number;
    };

    // Transform the API response to match our expected format
    const artworks: Artwork[] = (response.data.data as ApiArtworkItem[]).map((item) => ({
      id: item.id,
      title: item.title || 'Untitled',
      place_of_origin: item.place_of_origin || 'Unknown',
      artist_display: item.artist_display || 'Unknown Artist',
      inscriptions: item.inscriptions || 'No inscriptions',
      date_start: item.date_start || 0,
      date_end: item.date_end || 0
    }));

    return {
      data: artworks,
      totalRecords: response.data.pagination.total
    };
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw new Error('Failed to fetch artworks');
  }
};
