import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home.tsx";
import NavLayout from "./components/layout/navLayout.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Protected from "./components/layout/protected.tsx";

const router = createBrowserRouter([
  {
    element: <NavLayout />,
    children: [
      {
        path: "/",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
