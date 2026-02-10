import { Router } from "express";
import { auth, authCallback } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/", auth);

authRouter.post("/callback", authCallback);

export default authRouter;
