type FormField = {
  label: string;
  type: "text" | "para" | "single_choice" | "multiple_choice";
  options?: string[]; // Only for multiple_choice
  required: boolean;
};

type Form = {
  title: string;
  description?: string;
  fields: FormField[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export { Form, FormField };
