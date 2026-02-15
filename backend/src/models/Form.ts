import mongoose from "mongoose";
import type { Form, FormField } from "../types/Form.DB";

const FormFieldSchema = new mongoose.Schema<FormField>({
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "para", "single_choice", "multiple_choice"],
    required: true,
  },
  options: [{ type: String }], // Only for multiple_choice
  required: { type: Boolean, required: true },
});

const FormSchema = new mongoose.Schema<Form>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fields: { type: [FormFieldSchema], default: [] },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const FormModel = mongoose.model<Form>("Form", FormSchema);

export default FormModel;
