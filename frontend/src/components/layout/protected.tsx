import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import authService from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";

type ProtectedProps = {
  children: React.ReactNode;
};

const Protected = ({ children }: ProtectedProps) => {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // If already authenticated, skip verification
      if (isAuthenticated) {
        setIsVerifying(false);
        return;
      }

      console.log("Protected component - Verifying token...");

      const data = await authService.authorizeWithJWTToken();

      if (data?.success && data.user) {
        login({
          userId: data.user.userId,
          name: data.user.name,
          email: data.user.email,
          pictureUrl: data.user.profile,
        });
        setIsVerifying(false);
      } else {
        // Token verification failed, redirect to home
        console.log(
          "Protected component - Auth verification failed, redirecting to home",
        );
        setIsVerifying(false);
        navigate("/", { replace: true });
      }
    };

    verifyAuth();
  }, [isAuthenticated, login, navigate]);

  // Show loading state while verifying
  if (isVerifying) {
    return null;
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default Protected;
