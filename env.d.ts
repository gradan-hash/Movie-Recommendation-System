/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_Read_Access_Token: string
  readonly VITE_TMDB_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}