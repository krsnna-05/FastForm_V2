import { envConfig } from "@/config/env";

class AuthService {
  authorizeWithGoogle = async () => {
    window.location.href = `${envConfig.BACKEND_URI}/api/auth/google`;
  };

  authorizeWithJWTToken = async () => {
    console.log("Attempting to authorize with JWT token...");

    const lastUserData = JSON.parse(
      localStorage.getItem("fastform_last_user") || "null",
    );

    console.log("Found last user data in localStorage:", lastUserData);

    if (!lastUserData || !lastUserData.user || !lastUserData.JWTToken) {
      return;
    }

    const res = await fetch(`${envConfig.BACKEND_URI}/api/auth/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lastUserData.JWTToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
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

      if (data.success) {
        localStorage.setItem(
          "fastform_last_user",
          JSON.stringify({ user: data.user, JWTToken: data.JWTToken }),
        );
      }

      return data;
    } catch (error) {
      console.error("Auth callback error:", error);
    }
  };
}

export default new AuthService();
