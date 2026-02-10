import express from "express";
import cors from "cors";
import { envConfig, googleAuthConfig, googleAuthScopes } from "./config/env";

// type imports
import { Request, Response } from "express";
import { connectDB } from "./DB";
import authRouter from "./routes/auth.route";

const app = express();
const PORT = envConfig.PORT || 3000;

connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1); // Exit the process with an error code
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Server is Running! 🚀",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on local 🚀 : http://localhost:${PORT}`);
});
