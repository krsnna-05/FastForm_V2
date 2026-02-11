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

      const user = await DBService.getUserByEmail(payload.email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (payload.userId !== user.userId.toString()) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized Access",
        });
      }

      return res.json({
        success: true,
        JWTToken: token,
        user: {
          userId: payload.userId,
          name: payload.name,
          email: payload.email,
          profile: user.user.profilePictureUrl,
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

  return res.redirect(redirectURL);
};

const authCallback = async (req: Request, res: Response) => {
  try {
    const code =
      typeof req.query.code === "string"
        ? req.query.code
        : typeof req.body?.code === "string"
          ? req.body.code
          : null;

    if (!code) {
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

    const userResult = await DBService.getUserByEmail(userInfo.email);

    if (userResult) {
      const { user, userId } = userResult;

      await DBService.updateUserTokens(
        userId,
        tokens.access_token,
        tokens.refresh_token,
      );

      const JWTToken = authService.generateJWTToken({
        userId,
        name: user.name,
        email: user.email,
      });

      return res.json({
        success: true,
        message: "Authentication Successful",
        user: {
          userId,
          name: user.name,
          email: user.email,
          profile: user.profilePictureUrl,
        },
        JWTToken,
      });
    }

    const isUserAdded = await DBService.addUser({
      email: userInfo.email,
      name: userInfo.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      profilePictureUrl: userInfo.picture,
    });

    if (!isUserAdded) {
      return res.status(500).json({
        success: false,
        error: "user_creation_failed",
        message: "Failed to create user in the database",
      });
    }

    const createdUserResult = await DBService.getUserByEmail(userInfo.email);

    if (!createdUserResult) {
      return res.status(500).json({
        success: false,
        error: "user_fetch_failed",
        message: "Failed to fetch user from the database",
      });
    }

    const { user, userId } = createdUserResult;

    const JWTToken = authService.generateJWTToken({
      userId,
      name: user.name,
      email: user.email,
    });

    return res.json({
      success: true,
      message: "User Created Successfully",
      user: {
        userId,
        name: user.name,
        email: user.email,
        profile: user.profilePictureUrl,
      },
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
