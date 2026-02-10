import { Request, Response } from "express";
import authService from "../services/auth.service";

const auth = async (req: Request, res: Response) => {
  try {
    const authMethod = req.query.authMethod as "auto" | "clicked" | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authMethod === "auto") {
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

    if (!authHeader && authMethod === "clicked") {
      const redirectURL = authService.getRedirectURL();
      return res.redirect(redirectURL);
    }

    return res.status(400).json({
      success: false,
      message: "Invalid auth request",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

const authCallback = (req: Request, res: Response) => {};

export { auth, authCallback };
