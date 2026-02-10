interface EnvConfig {
  BACKEND_URI: string;
  ENV: "dev" | "prod";
}

export const envConfig: EnvConfig = {
  BACKEND_URI: import.meta.env.VITE_BACKEND_URI,
  ENV: import.meta.env.VITE_ENV,
};
