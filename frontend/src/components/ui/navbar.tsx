"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Building2, FormIcon, LogOutIcon } from "lucide-react";
import { ModeToggle } from "../theme-switch";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Link } from "react-router";

// Simple logo component for the navbar
const Logo = () => {
  return (
    <div className="bg-primary p-2 rounded-xl">
      <FormIcon className="w-5 h-5 text-primary-foreground" />
    </div>
  );
};

const CtaLogo = ({ varient }: { varient: "dark" | "light" }) => {
  if (varient === "light") {
    return (
      <svg
        aria-label="Google"
        height={16}
        viewBox="0 0 24 24"
        width={16}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.49 12.27c0-.81-.07-1.6-.2-2.36H12v4.47h6.44a5.5 5.5 0 0 1-2.39 3.62v3.01h3.86c2.26-2.08 3.58-5.15 3.58-8.74z"
          fill="#ffffff"
        />
        <path
          d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.86-3.01c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.29v3.11A12 12 0 0 0 12 24z"
          fill="#ffffff"
        />
        <path
          d="M5.27 14.26A7.2 7.2 0 0 1 4.9 12c0-.78.13-1.54.37-2.26V6.63H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.37l3.98-3.11z"
          fill="#ffffff"
        />
        <path
          d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.95 1.22 15.24 0 12 0 7.31 0 3.2 2.69 1.29 6.63l3.98 3.11C6.22 6.86 8.87 4.75 12 4.75z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (varient === "dark") {
    return (
      <svg
        aria-label="Google"
        height={16}
        viewBox="0 0 24 24"
        width={16}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.49 12.27c0-.81-.07-1.6-.2-2.36H12v4.47h6.44a5.5 5.5 0 0 1-2.39 3.62v3.01h3.86c2.26-2.08 3.58-5.15 3.58-8.74z"
          fill="#000000"
        />
        <path
          d="M12 24c3.24 0 5.95-1.08 7.93-2.93l-3.86-3.01c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.29v3.11A12 12 0 0 0 12 24z"
          fill="#000000"
        />
        <path
          d="M5.27 14.26A7.2 7.2 0 0 1 4.9 12c0-.78.13-1.54.37-2.26V6.63H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.37l3.98-3.11z"
          fill="#000000"
        />
        <path
          d="M12 4.75c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.95 1.22 15.24 0 12 0 7.31 0 3.2 2.69 1.29 6.63l3.98 3.11C6.22 6.86 8.87 4.75 12 4.75z"
          fill="#000000"
        />
      </svg>
    );
  }
};

// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    aria-label="Menu"
    className={cn("pointer-events-none", className)}
    fill="none"
    height={16}
    role="img"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...(props as any)}
  >
    <path
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
      d="M4 12L20 12"
    />
    <path
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
      d="M4 12H20"
    />
    <path
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
      d="M4 12H20"
    />
  </svg>
);

// Types
export interface NavbarNavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: NavbarNavLink[] | null;
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaLogoLight?: React.ReactNode;
  ctaLogoDark?: React.ReactNode;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
  onLogoutClick?: () => void;
  isAuthenticated?: boolean;
  userName?: string;
  userPictureUrl?: string;
  userImageFallback?: string;
}

// Default navigation links
const defaultNavigationLinks: NavbarNavLink[] = [
  { href: "#", label: "Home", active: true },
  { href: "#about", label: "About" },
];

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = "/",
      navigationLinks = defaultNavigationLinks,
      signInText = "Sign In",
      signInHref = "#signin",
      ctaText = "Get Started with Google",
      ctaHref = "#get-started",
      ctaLogoLight = <CtaLogo varient="light" />,
      ctaLogoDark = <CtaLogo varient="dark" />,
      onSignInClick,
      onLogoutClick,
      onCtaClick,
      isAuthenticated = false,
      userName,
      userPictureUrl,
      userImageFallback,
      ...props
    },
    ref,
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    return (
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
          className,
        )}
        ref={combinedRef}
        {...(props as any)}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-6">
              <Link to={logoHref}>
                <button
                  type="button"
                  className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
                >
                  <div className="text-2xl">{logo}</div>
                  <span className=" font-bold text-xl ">FastForm</span>
                </button>
              </Link>
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <ModeToggle />
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 bg-secondary p-2 rounded-full hover:bg-secondary/80 cursor-pointer">
                      {userPictureUrl && (
                        <Avatar>
                          <AvatarImage src={userPictureUrl} alt={userName} />
                          <AvatarFallback>
                            {userImageFallback || userName?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-sm font-medium">{userName}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem>
                      <Link to={"/workspace"} className=" flex gap-2">
                        {" "}
                        <Building2 />
                        <span>Workspace</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className=" hover:text-destructive! hover:bg-destructive/20!"
                      onClick={onLogoutClick}
                    >
                      <LogOutIcon className=" group-hover:text-destructive" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ModeToggle />
              </>
            )}
          </div>
        </div>
      </header>
    );
  },
);

Navbar.displayName = "Navbar";

export { Logo, CtaLogo, HamburgerIcon };
