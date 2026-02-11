import { Router } from "express";
import { auth, authCallback, googleAuth } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/verify", auth);
authRouter.get("/google", googleAuth);
authRouter.post("/callback", authCallback);

export default authRouter;
