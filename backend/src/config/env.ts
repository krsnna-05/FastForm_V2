import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: "dev" | "prod";
  MONGODB_URI: string;
  JWT_SECRET: string;
}

interface GoogleAuthConfig {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
}

const envConfig: EnvConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV === "prod" ? "prod" : "dev",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/fastform",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
};

const googleAuthConfig: GoogleAuthConfig = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
};

const googleAuthScopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/forms.body",
];

export { envConfig, googleAuthConfig, googleAuthScopes };
