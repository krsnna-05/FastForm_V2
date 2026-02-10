import { google } from "googleapis";
import { googleAuthConfig, googleAuthScopes, envConfig } from "../config/env";
import {} from "../types/User.DB";
import JWTUserPayload from "../types/User.JWT";
import jwt from "jsonwebtoken";

class AuthService {
  private oAuth2Client = new google.auth.OAuth2(
    googleAuthConfig.GOOGLE_CLIENT_ID,
    googleAuthConfig.GOOGLE_CLIENT_SECRET,
    googleAuthConfig.GOOGLE_REDIRECT_URI,
  );

  constructor() {}

  getRedirectURL(): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: googleAuthScopes,
      include_granted_scopes: true,
      prompt: "consent",
    });
  }

  generateJWTToken(user: JWTUserPayload): string {
    return jwt.sign(user, envConfig.JWT_SECRET, { expiresIn: "5h" });
  }

  verifyJWTToken(token: string): JWTUserPayload | null {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JWTUserPayload;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  }
}
