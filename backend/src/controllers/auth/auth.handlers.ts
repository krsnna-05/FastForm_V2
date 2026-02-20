import { Request, Response } from "express";
import AuthService from "../../services/auth.service";
import {
  authCodeRequiredResponse,
  invalidGrantResponse,
  unauthorizedResponse,
  userCreationFailedResponse,
  userFetchFailedResponse,
} from "./auth.responses";
import { parseBearerToken, parseOAuthCode } from "./auth.parsers";
import {
  exchangeCodeAndFetchGoogleUser,
  upsertUserAndGenerateJwt,
  verifyJwtAndLoadUser,
} from "./auth.workflows";

const auth = async (req: Request, res: Response) => {
  try {
    const token = parseBearerToken(req.headers.authorization);

    if (!token) {
      return unauthorizedResponse(res);
    }

    const authResult = await verifyJwtAndLoadUser(token);

    if (!authResult) {
      return unauthorizedResponse(res);
    }

    const { payload, userResult } = authResult;

    return res.json({
      success: true,
      JWTToken: token,
      user: {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        profile: userResult.user.profilePictureUrl,
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return unauthorizedResponse(res);
  }
};

const googleAuth = async (req: Request, res: Response) => {
  const authService = new AuthService();
  const redirectURL = authService.getRedirectURL();
  return res.redirect(redirectURL);
};

const authCallback = async (req: Request, res: Response) => {
  try {
    const code = parseOAuthCode(req);

    if (!code) {
      return authCodeRequiredResponse(res);
    }

    const exchangeResult = await exchangeCodeAndFetchGoogleUser(code);

    if (!exchangeResult) {
      return invalidGrantResponse(res);
    }

    const upsertResult = await upsertUserAndGenerateJwt(exchangeResult);

    if (upsertResult.status === "create_failed") {
      return userCreationFailedResponse(res);
    }

    if (upsertResult.status === "fetch_failed") {
      return userFetchFailedResponse(res);
    }

    const isExistingUser = upsertResult.status === "existing";

    return res.json({
      success: true,
      message: isExistingUser
        ? "Authentication Successful"
        : "User Created Successfully",
      user: {
        userId: upsertResult.userId,
        name: upsertResult.user.name,
        email: upsertResult.user.email,
        profile: upsertResult.user.profilePictureUrl,
      },
      JWTToken: upsertResult.JWTToken,
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return invalidGrantResponse(res);
  }
};

export { auth, authCallback, googleAuth };
