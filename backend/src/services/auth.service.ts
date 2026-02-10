import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { envConfig, googleAuthConfig, googleAuthScopes } from "../config/env";
import JWTUserPayload from "../types/User.JWT";

class AuthService {
  private oAuth2Client = new google.auth.OAuth2(
    googleAuthConfig.GOOGLE_CLIENT_ID,
    googleAuthConfig.GOOGLE_CLIENT_SECRET,
    googleAuthConfig.GOOGLE_REDIRECT_URI,
  );

  getRedirectURL = (): string => {
    return this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: googleAuthScopes,
      include_granted_scopes: true,
      prompt: "consent",
    });
  };

  generateJWTToken = (user: JWTUserPayload): string => {
    return jwt.sign(user, envConfig.JWT_SECRET, { expiresIn: "5h" });
  };

  verifyJWTToken = (token: string): JWTUserPayload | null => {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JWTUserPayload;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  };
}

export default new AuthService();
