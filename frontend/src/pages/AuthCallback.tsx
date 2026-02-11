import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import authService from "@/services/auth.service";
import { useNavigate } from "react-router";
import useAuthStore from "@/store/auth.store";

type AuthStatus = {
  success: boolean;
  error: string | null;
  state: "pending" | "done" | "error";
};

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    success: false,
    error: null,
    state: "pending",
  });
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setAuthStatus({
        success: false,
        error: `Authentication failed: ${error}`,
        state: "error",
      });
      return;
    }

    if (!code) {
      setAuthStatus({
        success: false,
        error: "Authentication code not found in URL.",
        state: "error",
      });
      return;
    }

    console.log("Received auth code:", code);
    console.log("Initiating auth callback with code:", code);

    const performAuth = async () => {
      try {
        const res = await authService.authCallback(code);
        setAuthStatus({
          success: true,
          error: null,
          state: "done",
        });
        login({
          userId: res.user.userId,
          name: res.user.name,
          email: res.user.email,
          pictureUrl: res.user.profile,
        });
      } catch (err) {
        console.error("Auth callback error:", err);
        setAuthStatus({
          success: false,
          error: "Failed to authenticate",
          state: "error",
        });
      }
    };

    performAuth();
  }, [searchParams]);

  useEffect(() => {
    if (authStatus.state === "done") {
      if (countdown <= 0) {
        navigate("/");
        return;
      }

      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [authStatus.state, countdown, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 font-sans">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="bg-primary p-2 rounded-xl">
          <FormIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">FastForms</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pt-8">
            <div className="flex justify-center mb-4 h-12">
              <AnimatePresence mode="wait">
                {authStatus.state === "pending" && (
                  <motion.div
                    key="pending-icon"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </motion.div>
                )}
                {authStatus.state === "done" && (
                  <motion.div
                    key="done-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className=" p-2 rounded-full"
                  >
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                  </motion.div>
                )}
                {authStatus.state === "error" && (
                  <motion.div
                    key="error-icon"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={authStatus.state}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <CardTitle className="text-xl font-semibold">
                  {authStatus.state === "pending" && "Verifying session"}
                  {authStatus.state === "done" && "Identity Verified"}
                  {authStatus.state === "error" && "Access Denied"}
                </CardTitle>
                <CardDescription className="mt-2 text-muted-foreground px-4">
                  {authStatus.state === "pending" &&
                    "Checking credentials with FastForms..."}
                  {authStatus.state === "done" &&
                    "Welcome back! Preparing your workspace."}
                  {authStatus.state === "error" &&
                    (authStatus.error || "Authentication failed.")}
                </CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent className="pb-8 pt-2">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative">
              <AnimatePresence>
                {authStatus.state === "pending" ? (
                  <motion.div
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear",
                    }}
                    className="absolute inset-0 w-1/3 bg-primary rounded-full"
                  />
                ) : (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    className={`h-full ${authStatus.state === "done" ? "bg-primary" : "bg-destructive"}`}
                  />
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs text-muted-foreground font-medium uppercase tracking-widest"
      >
        {authStatus.state === "pending" && "Loading..."}
        {authStatus.state === "done" && `Redirecting iN ${countdown}...`}
        {authStatus.state === "error" && "Please try again"}
      </motion.p>
    </div>
  );
};

export default AuthCallback;
