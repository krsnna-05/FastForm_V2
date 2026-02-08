import express from "express";
import cors from "cors";
import envConfig from "./config/env";

// type imports
import { Request, Response } from "express";

const app = express();
const PORT = envConfig.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Server is Running! 😁 🚀",
  });
});
