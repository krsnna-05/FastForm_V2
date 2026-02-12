import { Outlet } from "react-router";
import { Navbar } from "@/components/ui/navbar";
import authService from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import { useEffect, useState } from "react";

const NavLayout = () => {
  const [nameFallback, setNameFallback] = useState("");

  const { isAuthenticated, User, logout } = useAuthStore();

  useEffect(() => {
    const name = User?.name;

    const firstName = name?.split(" ")[0] || "";
    const lastName = name?.split(" ")[1] || "";

    const fallback = firstName[0] + lastName[0] || "";

    setNameFallback(fallback.toUpperCase());
  }, [User, isAuthenticated]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("fastform_last_user");
  };

  return (
    <div className=" h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar
        onCtaClick={authService.authorizeWithGoogle}
        isAuthenticated={isAuthenticated}
        userName={User?.name}
        userPictureUrl={User?.pictureUrl}
        onLogoutClick={handleLogout}
        userImageFallback={nameFallback}
        navigationLinks={[]}
      />
      <Outlet />
    </div>
  );
};

export default NavLayout;
