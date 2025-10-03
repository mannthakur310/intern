export interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export interface ArtworkApiResponse {
  data: Artwork[];
  totalRecords: number;
}

export interface PaginationParams {
  page: number;
  size: number;
}
