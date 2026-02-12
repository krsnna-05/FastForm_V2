import { Feature } from "@/components/home/feature";
import { Hero } from "@/components/home/hero";
import { CtaLogo, Logo } from "@/components/ui/navbar";
import authService from "@/services/auth.service";
import useAuthStore from "@/store/auth.store";
import { Bot, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { useTheme } from "next-themes";

const Home = () => {
  const { resolvedTheme } = useTheme();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <Hero
        icon={<Logo />}
        button={{
          text: "Get Started with Google",
          url: "#get-started",
          icon: (
            <CtaLogo varient={resolvedTheme === "dark" ? "dark" : "light"} />
          ),
        }}
        heading="Lovable For Google Forms"
        description="Create Google Forms by chatting. Transform your ideas into fully functional forms in seconds with our AI-powered form builder."
        trustText="Now Edit Your Google Faster and Better"
        isAuthenticated={isAuthenticated}
      />
      <Feature
        label="Why FastForms"
        title="Build Better Forms, Faster"
        features={[
          {
            heading: "AI-Powered",
            description:
              "Leverage cutting-edge AI to understand your form requirements naturally and create them instantly.",
            icon: <Bot className="size-4 md:size-6" />,
          },
          {
            heading: "Lightning Fast",
            description:
              "Generate fully functional Google Forms in seconds. No more manual setup or tedious configuration.",
            icon: <Zap className="size-4 md:size-6" />,
          },
          {
            heading: "Seamless Integration",
            description:
              "Works directly with Google Forms. Your forms are stored in your Google Drive and fully compatible.",
            icon: <CheckCircle2 className="size-4 md:size-6" />,
          },
          {
            heading: "Clean & Ready",
            description:
              "Forms are generated in a clean, ready-to-use format so you can start collecting responses immediately.",
            icon: <Sparkles className="size-4 md:size-6" />,
          },
        ]}
      />
    </div>
  );
};

export default Home;
