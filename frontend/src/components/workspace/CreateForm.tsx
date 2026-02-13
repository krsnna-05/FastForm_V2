import React, { useState } from "react";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "../ai-elements/prompt-input";
import { Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";
import { v4 } from "uuid";
import { useNavigate } from "react-router";

const CreateForm = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (message: PromptInputMessage) => {
    const newFormId = v4();

    localStorage.setItem(
      `fastform_create_form_${newFormId}`,
      JSON.stringify({
        prompt: message.text,
      }),
    );

    const formEditURL = `/workspace/form/edit?formId=${newFormId}`;

    navigate(formEditURL); // Navigate to the form edit page with the new form ID
  };

  return (
    <DrawerContent className="max-h-[85vh]">
      <div className="mx-auto w-full max-w-4xl">
        <DrawerHeader className="relative border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <DrawerTitle className="text-xl font-semibold">
                  Create New Form
                </DrawerTitle>
                <DrawerDescription className="text-sm">
                  Describe your form and let AI generate it for you
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                label: "Smart AI",
                desc: "Powered by Mistral:3-3b (Local Model)",
              },
              { label: "Instant", desc: "Generated in seconds" },
              { label: "Customizable", desc: "Edit anytime" },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-gradient-to-br from-card to-card/50 p-3 text-center backdrop-blur-sm"
              >
                <div className="text-xs font-semibold text-foreground">
                  {item.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Describe Your Form
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <PromptInput
              onSubmit={handleSubmit}
              className="border-2 border-border/50 rounded-xl shadow-lg transition-all focus-within:border-primary/50 focus-within:shadow-xl"
              globalDrop
              multiple
            >
              <PromptInputBody>
                <PromptInputTextarea
                  onChange={(e) => setText(e.target.value)}
                  value={text}
                  placeholder="E.g., Create a customer feedback form with name, email, rating (1-5 stars), and comments..."
                  className="min-h-[160px] text-sm resize-none border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
              </PromptInputBody>
              <PromptInputFooter className="border-t bg-muted/30 px-4 py-3">
                <PromptInputTools></PromptInputTools>
                <PromptInputSubmit
                  disabled={!text}
                  className="gap-2 shadow-md hover:shadow-lg transition-all w-36"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Form
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </DrawerContent>
  );
};

export default CreateForm;
