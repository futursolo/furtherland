interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly BASE_URL: string;
  readonly ASSET_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
