import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import GoogleApiService from "../services/googleapi.service";

const auth = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const authService = new AuthService();

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
  const authService = new AuthService();

  const redirectURL = authService.getRedirectURL();
  console.log("Redirecting to Google OAuth URL:", redirectURL);

  return res.redirect(redirectURL);
};

const authCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        error: "auth_code_required",
      });
    }

    const authService = new AuthService();

    await authService.setCredentials(code);

    const googleApiService = new GoogleApiService(
      authService.getoAuth2Client(),
    );

    const userInfo = await googleApiService.getUserInfo();

    console.log("User info retrieved from Google:", userInfo);

    return res.json({
      success: true,
      message: "Authentication successful",
      user: userInfo,
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return res.status(400).json({
      success: false,
      error: "invalid_grant",
      message: "Failed to exchange authorization code",
    });
  }
};

export { auth, authCallback, googleAuth };
