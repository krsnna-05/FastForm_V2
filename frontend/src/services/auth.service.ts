import { envConfig } from "@/config/env";

class AuthService {
  authorizeWithGoogle = async () => {
    window.location.href = `${envConfig.BACKEND_URI}/api/auth/google`;
  };

  authorizeWithJWTToken = async () => {
    const JWTToken = localStorage.getItem("fastform_jwt_token");

    fetch("/api/auth/google", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWTToken}`,
      },
    });
  };
}

export default new AuthService();
