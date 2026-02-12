import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquareText, MonitorSmartphone } from "lucide-react";

const FormPreview = () => {
  return (
    <div className=" flex-1 h-full overflow-auto">
      <TopBar />
      <div className=" h-[200vh] "></div>
    </div>
  );
};

export default FormPreview;

const TopBar = () => {
  const [activeView, setActiveView] = useState<"chat" | "preview">("preview");

  return (
    <div className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="text-base font-semibold text-foreground sm:text-lg">
            Customer Feedback Form
          </div>
          <div className="text-[11px] text-muted-foreground sm:text-xs">
            Last updated 13 Feb 2026, 2:45 PM
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto md:justify-end">
          <div className="flex w-full items-center justify-between rounded-full border border-border/60 bg-muted/60 p-1 md:hidden">
            <button
              type="button"
              onClick={() => setActiveView("chat")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeView === "chat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              aria-pressed={activeView === "chat"}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveView("preview")}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeView === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
              aria-pressed={activeView === "preview"}
            >
              <MonitorSmartphone className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>
          <Button variant="secondary" className="w-full gap-2 sm:w-auto">
            Save to Google Forms
          </Button>
        </div>
      </div>
    </div>
  );
};
