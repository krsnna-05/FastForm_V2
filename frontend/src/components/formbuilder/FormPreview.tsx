import { useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { envConfig } from "@/config/env";
import { Spinner } from "@/components/ui/spinner";

const CREATE_GOOGLE_FORM_ENDPOINT = `${envConfig.BACKEND_URI}/api/form/google/create`;

type FormPreviewProps = {
  form: Form | {};
  setForm?: (form: Form) => void;
  isLoading?: boolean;
};

const FormPreview = ({
  form,
  setForm,
  isLoading = false,
}: FormPreviewProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const normalizedFields = useMemo(() => {
    const safeForm = form as Form;
    return (safeForm.fields || [])
      .map((field, index) => ({
        ...field,
        type: field.type || "text",
        location: typeof field.location === "number" ? field.location : index,
      }))
      .slice()
      .sort((a, b) => a.location - b.location);
  }, [form]);

  const buildGoogleFormURL = (googleFormId: string) =>
    `https://docs.google.com/forms/d/${googleFormId}/edit`;

  const CreateGoogleForm = async () => {
    setIsExporting(true);

    const { userId, _id } = form as Form;

    const safeForm = form as Form;

    console.log(safeForm);

    const normalizedGoogleFormPayload = {
      title: safeForm.title,
      description: safeForm.description,
      fields: (safeForm.fields || []).map((field, index) => {
        const normalizedType =
          (field as FormField & { fieldType?: FormField["type"] }).fieldType ||
          field.type ||
          "text";

        return {
          label: field.label,
          fieldType: normalizedType,
          options: field.options,
          required: field.required,
          location: typeof field.location === "number" ? field.location : index,
        };
      }),
    };

    try {
      const res = await fetch(CREATE_GOOGLE_FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          formId: _id,
          form: normalizedGoogleFormPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to create Google Form:", data);
        return;
      }

      setForm &&
        setForm({
          ...(form as Form),
          googleFormId: data.data.googleForm,
          googleFormUrl: buildGoogleFormURL(data.data.googleForm),
          isConnectedToGoogleForm: true,
        });

      console.log("Google Form created successfully:", data);
    } finally {
      setIsExporting(false);
    }
  };

  const title = (form as Form).title || "Untitled Form";
  const description = (form as Form).description;

  return (
    <div className=" flex-1 h-full overflow-auto pb-24">
      <TopBar
        form={form}
        handleCreateGoogleForm={CreateGoogleForm}
        isExporting={isExporting}
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
        <FormTitlePart title={title} description={description} />
        {normalizedFields.length === 0 ? (
          isLoading ? (
            <>
              <SkeletonField />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              Start by describing the form you want. Fields will appear here.
            </div>
          )
        ) : (
          <>
            {normalizedFields.map((field) => {
              const fieldType =
                ((field as FormField & { fieldType?: string }).fieldType ??
                  field.type) ||
                "text";

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
            })}
            {isLoading && (
              <>
                <SkeletonField />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SkeletonField = () => {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};

export default FormPreview;

type TopBarProps = {
  form: Form | {};
  handleCreateGoogleForm: () => void;
  isExporting: boolean;
};

const TopBar = ({ form, handleCreateGoogleForm, isExporting }: TopBarProps) => {
  const [activeView, setActiveView] = useState<"chat" | "preview">("preview");

  console.log(form);

  if (!form || !("title" in form)) {
    return (
      <div className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-5 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="text-base font-semibold text-foreground sm:text-lg">
            {form.title || "Untitled Form"}
          </div>
          <div className="text-[11px] text-muted-foreground sm:text-xs">
            Created at{" "}
            {form.createdAt
              ? new Date(form.createdAt).toLocaleString()
              : "Unknown"}
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
          {!form.isConnectedToGoogleForm && (
            <Button
              variant="secondary"
              className="w-full gap-2 sm:w-auto"
              onClick={handleCreateGoogleForm}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Exporting...
                </>
              ) : (
                "Export to Google Form"
              )}
            </Button>
          )}

          {form.isConnectedToGoogleForm && form.googleFormUrl && (
            <Button
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              asChild
            >
              <a
                href={form.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Forms
              </a>
            </Button>
          )}

          {form.isConnectedToGoogleForm && form.googleFormId && (
            <Button variant="default" className="w-full gap-2 sm:w-auto">
              Sync with Google Form
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
