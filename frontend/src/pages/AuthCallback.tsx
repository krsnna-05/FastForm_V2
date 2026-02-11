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

type AuthState = "done" | "pending" | "error";

type AuthStatus = {
  success: boolean;
  error: string | null;
  state: AuthState;
};

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    success: false,
    error: null,
    state: "pending",
  });

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // timeout to simulate processing delay and show the pending state
    const timeout = setTimeout(() => {
      if (error) {
        setAuthStatus({
          success: false,
          error: error,
          state: "error",
        });
      } else if (code) {
        setAuthStatus({
          success: true,
          error: null,
          state: "done",
        });
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-primary p-2 rounded-xl">
          <FormIcon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">FastForms</span>
      </div>

      <Card className="w-full max-w-sm border-border/50 shadow-xl animate-in zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            {authStatus.state === "pending" && (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            )}
            {authStatus.state === "done" && (
              <CheckCircle2 className="w-10 h-10 text-primary animate-in zoom-in duration-300" />
            )}
            {authStatus.state === "error" && (
              <AlertCircle className="w-10 h-10 text-destructive animate-in shake duration-300" />
            )}
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {authStatus.state === "pending" && "Verifying session"}
            {authStatus.state === "done" && "Welcome back"}
            {authStatus.state === "error" && "Authentication failed"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {authStatus.state === "pending" &&
              "Please wait while we secure your connection."}
            {authStatus.state === "done" &&
              "You have successfully authenticated."}
            {authStatus.state === "error" &&
              (authStatus.error || "An unexpected error occurred.")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center pb-8">
          {authStatus.state === "pending" && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress w-1/2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
