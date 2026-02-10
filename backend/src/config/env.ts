import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: "dev" | "prod";
  MONGODB_URI: string;
}

const envConfig: EnvConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV === "prod" ? "prod" : "dev",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/fastform",
};

export default envConfig;
