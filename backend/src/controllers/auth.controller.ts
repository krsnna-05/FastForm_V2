import { Request, Response } from "express";
import authService from "../services/auth.service";

const auth = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : authHeader;

      const payload = await authService.authorizeWithJWTToken(token);

      return res.json({
        success: true,
        JWTToken: token,
        user: {
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
        },
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

const googleAuth = async (req: Request, res: Response) => {
  const redirectURL = authService.getRedirectURL();
  console.log("Redirecting to Google OAuth URL:", redirectURL);

  return res.redirect(redirectURL);
};

const authCallback = (req: Request, res: Response) => {};

export { auth, authCallback, googleAuth };
