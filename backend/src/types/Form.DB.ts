type FormField = {
  id: string;
  label: string;
  fieldType: "text" | "para" | "radio" | "checkbox";
  options?: string[]; // Only for multiple_choice
  required: boolean;
  location: number; // Position of the field in the form
};

type Form = {
  _id: string;
  title: string;
  description?: string;
  fields: FormField[];
  userId: string;
  googleFormId?: string;
  googleFormUrl?: string;
  isSyncedWithGoogleForm: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export { Form, FormField };
