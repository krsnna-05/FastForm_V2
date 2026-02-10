import { Outlet } from "react-router";
import { Navbar } from "@/components/ui/navbar";
import authService from "@/services/auth.service";

const NavLayout = () => {
  return (
    <div className=" h-screen w-screen flex flex-col bg-background text-foreground">
      <Navbar onCtaClick={authService.authorizeWithGoogle} />
      <Outlet />
    </div>
  );
};

export default NavLayout;
