import { Request, Response } from "express";
import authService from "../services/auth.service";

const auth = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const authServiceInstance = new authService();

    if (authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : authHeader;

      const payload = await authServiceInstance.authorizeWithJWTToken(token);

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
  const authServiceInstance = new authService();

  const redirectURL = authServiceInstance.getRedirectURL();
  console.log("Redirecting to Google OAuth URL:", redirectURL);

  return res.redirect(redirectURL);
};

const authCallback = (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "auth_code_required",
    });
  }
};

export { auth, authCallback, googleAuth };
