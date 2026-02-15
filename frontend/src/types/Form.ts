type FormField = {
  label: string;
  type: "text" | "para" | "single_choice" | "multiple_choice";
  options?: string[]; // Only for multiple_choice
  required: boolean;
  location: number; // Position of the field in the form
};

type Form = {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  fields: FormField[] | [];
};

export type { Form, FormField };
