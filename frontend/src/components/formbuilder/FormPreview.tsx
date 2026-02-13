import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquareText, MonitorSmartphone } from "lucide-react";
import {
  CheckboxFieldPart,
  FormTitlePart,
  ParaFieldPart,
  RadioFieldPart,
  TextFieldPart,
} from "@/components/formbuilder/FormPart";
import type { Form, FormField } from "@/types/Form";

type FormPreviewProps = {
  form: Form | {};
};

const FormPreview = ({ form }: FormPreviewProps) => {
  const normalizedFields = useMemo(() => {
    const safeForm = form as Form;
    return (safeForm.fields || [])
      .slice()
      .sort((a, b) => a.location - b.location);
  }, [form]);

  const title = (form as Form).title || "Untitled Form";
  const description = (form as Form).description;

  return (
    <div className=" flex-1 h-full overflow-auto">
      <TopBar />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
        <FormTitlePart title={title} description={description} />
        {normalizedFields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            Start by describing the form you want. Fields will appear here.
          </div>
        ) : (
          normalizedFields.map((field) => {
            const fieldType =
              (field as FormField & { fieldType?: string }).fieldType ??
              field.type;

            if (fieldType === "text") {
              return (
                <TextFieldPart
                  key={`${field.label}-${field.location}`}
                  label={field.label}
                  required={field.required}
                />
              );
            }

            if (fieldType === "para") {
              return (
                <ParaFieldPart
                  key={`${field.label}-${field.location}`}
                  label={field.label}
                  required={field.required}
                />
              );
            }

            if (fieldType === "radio" || fieldType === "single_choice") {
              return (
                <RadioFieldPart
                  key={`${field.label}-${field.location}`}
                  label={field.label}
                  required={field.required}
                  options={field.options || []}
                />
              );
            }

            if (fieldType === "checkbox" || fieldType === "multiple_choice") {
              return (
                <CheckboxFieldPart
                  key={`${field.label}-${field.location}`}
                  label={field.label}
                  required={field.required}
                  options={field.options || []}
                />
              );
            }

            return null;
          })
        )}
      </div>
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
