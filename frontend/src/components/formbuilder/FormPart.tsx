import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TitlePartProps = {
  title: string;
  description?: string;
};

type FieldBaseProps = {
  label: string;
  required?: boolean;
  description?: string;
};

type ChoiceFieldProps = FieldBaseProps & {
  options: string[];
};

const FieldLabel = ({ label, required }: FieldBaseProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {required ? (
        <span className="text-xs font-semibold text-red-500">*</span>
      ) : null}
    </div>
  );
};

const FieldDescription = ({ description }: { description?: string }) => {
  if (!description) {
    return null;
  }

  return <p className="text-xs text-muted-foreground">{description}</p>;
};

const FieldContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-4 shadow-sm">
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

const FormTitlePart = ({ title, description }: TitlePartProps) => {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
};

const TextFieldPart = ({ label, required, description }: FieldBaseProps) => {
  return (
    <FieldContainer>
      <FieldLabel label={label} required={required} />
      <FieldDescription description={description} />
      <Input placeholder="Short answer" aria-required={required} disabled />
    </FieldContainer>
  );
};

const ParaFieldPart = ({ label, required, description }: FieldBaseProps) => {
  return (
    <FieldContainer>
      <FieldLabel label={label} required={required} />
      <FieldDescription description={description} />
      <Textarea placeholder="Long answer" aria-required={required} disabled />
    </FieldContainer>
  );
};

const RadioFieldPart = ({
  label,
  required,
  description,
  options,
}: ChoiceFieldProps) => {
  return (
    <FieldContainer>
      <FieldLabel label={label} required={required} />
      <FieldDescription description={description} />
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={`${label}-radio-${index}`}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <input
              type="radio"
              name={label}
              disabled
              className="h-4 w-4 accent-foreground"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </FieldContainer>
  );
};

const CheckboxFieldPart = ({
  label,
  required,
  description,
  options,
}: ChoiceFieldProps) => {
  return (
    <FieldContainer>
      <FieldLabel label={label} required={required} />
      <FieldDescription description={description} />
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={`${label}-checkbox-${index}`}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <input
              type="checkbox"
              disabled
              className="h-4 w-4 accent-foreground"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </FieldContainer>
  );
};

export {
  FormTitlePart,
  TextFieldPart,
  ParaFieldPart,
  RadioFieldPart,
  CheckboxFieldPart,
};
