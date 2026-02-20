import { z } from "zod";

const createGoogleFormBodySchema = z.object({
  userId: z.string("User ID is String").min(1, "User ID is required"),
  formId: z.string("Form ID must be a string").min(1, "Form ID is required"),
  form: z.object({
    title: z
      .string("Form title must be a string")
      .min(1, "Form title is required"),
    description: z.string("Form description must be a string").optional(),
    fields: z.array(
      z.object({
        label: z
          .string("Field label must be a string")
          .min(1, "Field label is required"),
        fieldType: z.enum(["text", "para", "radio", "checkbox"], {
          message:
            "Field type must be one of text, para, single_choice, or multiple_choice",
        }),
        options: z.array(z.string("Option must be a string")).optional(),
        required: z.boolean("Required must be a boolean"),
        location: z.number("Location must be a number"),
      }),
    ),
  }),
});

export { createGoogleFormBodySchema };
