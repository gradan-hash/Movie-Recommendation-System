// TMDB Movie Interfaces
export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface MovieDetails extends Movie {
  budget: number
  genres: Genre[]
  homepage: string | null
  imdb_id: string | null
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  revenue: number
  runtime: number | null
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string | null
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface SearchMoviesResponse extends TMDBResponse<Movie> {}

export interface PopularMoviesResponse extends TMDBResponse<Movie> {}

// TV Series interfaces
export interface TVSeries {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_name: string
  popularity: number
  origin_country: string[]
}

export interface TVSeriesDetails extends TVSeries {
  created_by: Creator[]
  episode_run_time: number[]
  genres: Genre[]
  homepage: string | null
  in_production: boolean
  languages: string[]
  last_air_date: string | null
  last_episode_to_air: Episode | null
  next_episode_to_air: Episode | null
  networks: Network[]
  number_of_episodes: number
  number_of_seasons: number
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  seasons: Season[]
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string | null
  type: string
}

export interface Creator {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string | null
}

export interface Episode {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  runtime: number
  season_number: number
  show_id: number
  still_path: string | null
  vote_average: number
  vote_count: number
}

export interface Network {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface Season {
  air_date: string | null
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
}

export interface PopularTVSeriesResponse extends TMDBResponse<TVSeries> {}
export interface SearchTVSeriesResponse extends TMDBResponse<TVSeries> {}

// Combined content type for unified display
export type MediaType = 'movie' | 'tv'

export interface MediaItem {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  media_type: MediaType
  original_title?: string
  original_name?: string
}

// Video interfaces for TMDB video API
export interface MovieVideo {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string
  name: string
  official: boolean
  published_at: string
  site: string
  size: number
  type: string
}

export interface MovieVideosResponse {
  id: number
  results: MovieVideo[]
}

// Cache interface for our TMDB service
export interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

// API Error interface
export interface TMDBError {
  status_message: string
  status_code: number
  success: boolean
}