import { google } from "googleapis";
import { googleAuthConfig, googleAuthScopes, envConfig } from "../config/env";
import {} from "../types/User.DB";
import JWTUserPayload from "../types/User.JWT";
import jwt from "jsonwebtoken";

const AuthService = (() => {
  const oAuth2Client = new google.auth.OAuth2(
    googleAuthConfig.GOOGLE_CLIENT_ID,
    googleAuthConfig.GOOGLE_CLIENT_SECRET,
    googleAuthConfig.GOOGLE_REDIRECT_URI,
  );

  const getRedirectURL = (): string => {
    return oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: googleAuthScopes,
      include_granted_scopes: true,
      prompt: "consent",
    });
  };

  const generateJWTToken = (user: JWTUserPayload): string => {
    return jwt.sign(user, envConfig.JWT_SECRET, { expiresIn: "5h" });
  };

  const verifyJWTToken = (token: string): JWTUserPayload | null => {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JWTUserPayload;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  };

  return { getRedirectURL, generateJWTToken, verifyJWTToken };
})();

export default AuthService;
