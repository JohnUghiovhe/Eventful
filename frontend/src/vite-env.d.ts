/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
  readonly VITE_ENABLE_DEMO_MODE?: string;
  readonly VITE_ENABLE_DARK_MODE?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
