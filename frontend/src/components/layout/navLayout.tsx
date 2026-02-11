import { Outlet } from "react-router";
import { Navbar } from "@/components/ui/navbar";
import authService from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";

const NavLayout = () => {
  const { isAuthenticated, User } = useAuthStore();

  return (
    <div className=" h-screen w-screen flex flex-col bg-background text-foreground">
      <Navbar
        onCtaClick={authService.authorizeWithGoogle}
        isAuthenticated={isAuthenticated}
        userName={User?.name}
        userPictureUrl={User?.pictureUrl}
      />
      <Outlet />
    </div>
  );
};

export default NavLayout;
