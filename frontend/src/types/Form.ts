type FormField = {
  label: string;
  type: "text" | "para" | "radio" | "checkbox";
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
  googleFormId?: string;
  googleFormUrl?: string;
  isConnectedToGoogleForm?: boolean;
  createdAt: Date;
};

export type { Form, FormField };
