import React, { useEffect } from "react";
import authService from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";

type ProtectedProps = {
  children: React.ReactNode;
};

const Protected = ({ children }: ProtectedProps) => {
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    console.log("Checking authentication status...");
    console.log("Current authentication status:", isAuthenticated);

    if (isAuthenticated) return;

    // automated login through existing tokens in localStorage

    authService.authorizeWithJWTToken().then((data) => {
      if (data?.success) {
        login({
          userId: data.user.userId,
          name: data.user.name,
          email: data.user.email,
          pictureUrl: data.user.profile,
        });
      }
    });
  }, [isAuthenticated]);

  return children;
};

export default Protected;
