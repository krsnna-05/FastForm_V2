import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import GoogleApiService from "../services/googleapi.service";
import DBService from "../services/DB.service";

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

    const tokens = await authService.setCredentials(code);

    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      return res.status(400).json({
        success: false,
        error: "invalid_grant",
        message: "Failed to exchange authorization code",
      });
    }

    const googleApiService = new GoogleApiService(
      authService.getoAuth2Client(),
    );

    const userInfo = await googleApiService.getUserInfo();

    const isUserExists = await DBService.checkIfUserExistswithEmail(
      userInfo.email,
    );

    if (isUserExists) {
      const JWTToken = authService.generateJWTToken({
        userId: userInfo.userId,
        name: userInfo.name,
        email: userInfo.email,
      });

      await DBService.updateUserAccessToken(
        userInfo.userId,
        tokens.access_token,
      );

      const userId = await DBService.getUserIdByEmail(userInfo.email);

      return res.json({
        success: true,
        message: "User Creation Successful",
        user: {
          userId: userId,
          name: userInfo.name,
          email: userInfo.email,
        },
        JWTToken,
      });
    }

    const isUserAdded = await DBService.addUser({
      email: userInfo.email,
      name: userInfo.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      profilePictureUrl: userInfo.profilePictureUrl,
    });

    if (!isUserAdded) {
      return res.status(500).json({
        success: false,
        error: "user_creation_failed",
        message: "Failed to create user in the database",
      });
    }

    const JWTToken = authService.generateJWTToken({
      userId: userInfo.userId,
      name: userInfo.name,
      email: userInfo.email,
    });

    return res.json({
      success: true,
      message: "Authentication Successful",
      user: userInfo,
      JWTToken,
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
