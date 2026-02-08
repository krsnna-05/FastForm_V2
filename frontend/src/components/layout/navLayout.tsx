import React from "react";
import { Outlet } from "react-router";
import { Navbar } from "@/components/ui/navbar";

const NavLayout = () => {
  return (
    <div className=" h-screen w-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default NavLayout;
