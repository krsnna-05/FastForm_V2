import AuthService from "../../services/auth.service";
import DBService from "../../services/DB.service";
import GoogleApiService from "../../services/googleapi.service";

const verifyJwtAndLoadUser = async (token: string) => {
  const authService = new AuthService();
  const payload = await authService.authorizeWithJWTToken(token);
  const userResult = await DBService.getUserByEmail(payload.email);

  if (!userResult) {
    return null;
  }

  if (payload.userId !== userResult.userId.toString()) {
    return null;
  }

  return {
    payload,
    userResult,
  };
};

const exchangeCodeAndFetchGoogleUser = async (code: string) => {
  const authService = new AuthService();
  const tokens = await authService.setCredentials(code);

  if (!tokens || !tokens.access_token || !tokens.refresh_token) {
    return null;
  }

  const googleApiService = new GoogleApiService(authService.getoAuth2Client());
  const userInfo = await googleApiService.getUserInfo();

  return {
    authService,
    tokens,
    userInfo,
  };
};

const upsertUserAndGenerateJwt = async ({
  authService,
  tokens,
  userInfo,
}: {
  authService: AuthService;
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
  };
  userInfo: {
    email: string;
    name: string;
    picture: string;
  };
}) => {
  const existingUserResult = await DBService.getUserByEmail(userInfo.email);

  if (existingUserResult) {
    const { user, userId } = existingUserResult;

    await DBService.updateUserTokens(
      userId,
      tokens.access_token ?? "",
      tokens.refresh_token ?? "",
    );

    const JWTToken = authService.generateJWTToken({
      userId,
      name: user.name,
      email: user.email,
    });

    return {
      status: "existing" as const,
      user,
      userId,
      JWTToken,
    };
  }

  const isUserAdded = await DBService.addUser({
    email: userInfo.email,
    name: userInfo.name,
    accessToken: tokens.access_token ?? "",
    refreshToken: tokens.refresh_token ?? "",
    profilePictureUrl: userInfo.picture,
  });

  if (!isUserAdded) {
    return {
      status: "create_failed" as const,
    };
  }

  const createdUserResult = await DBService.getUserByEmail(userInfo.email);

  if (!createdUserResult) {
    return {
      status: "fetch_failed" as const,
    };
  }

  const { user, userId } = createdUserResult;

  const JWTToken = authService.generateJWTToken({
    userId,
    name: user.name,
    email: user.email,
  });

  return {
    status: "created" as const,
    user,
    userId,
    JWTToken,
  };
};

export {
  verifyJwtAndLoadUser,
  exchangeCodeAndFetchGoogleUser,
  upsertUserAndGenerateJwt,
};
