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

  authCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${envConfig.BACKEND_URI}/api/auth/callback?code=${encodeURIComponent(code)}`,
        {
          method: "POST",
        },
      );

      const data = await response.json();
      console.log("Auth callback response:", data);

      if (data.success) {
        localStorage.setItem("fastform_jwt_token", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Auth callback error:", error);
    }
  };
}

export default new AuthService();
