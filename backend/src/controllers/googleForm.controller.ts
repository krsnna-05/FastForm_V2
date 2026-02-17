import { z } from "zod";
import { Request, Response } from "express";
import googleFormService from "../services/googleForm.service";

import type { forms_v1 } from "googleapis";

const bodySchema = z.object({
  title: z
    .string("Title is String")
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string("Description is String").optional(),
  userId: z.string("User ID is String").min(1, "User ID is required"),
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
        fieldType: z.enum(
          ["text", "para", "single_choice", "multiple_choice"],
          {
            message:
              "Field type must be one of text, para, single_choice, or multiple_choice",
          },
        ),
        options: z.array(z.string("Option must be a string")).optional(),
        required: z.boolean("Required must be a boolean"),
        location: z.number("Location must be a number"),
      }),
    ),
  }),
});

const createAndUpdateGoogleForm = async (req: Request, res: Response) => {
  let parsedBody;

  try {
    parsedBody = bodySchema.parse(req.body ?? {});
    const { title, description, userId, form } = parsedBody;
    // Continue with form creation logic here
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues,
      });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }

  try {
    const { userId, form } = parsedBody;

    const googleForm = new googleFormService(userId);

    const createFormResult = await googleForm
      .createGoogleForm({
        title: form.title,
        description: form.description,
      })
      .catch((error) => {
        throw new Error("Failed to create Google Form: " + error.message);
      });

    const updateFormResult = await googleForm.updateGoogleForm(
      createFormResult.data.formId!,
      form,
    );

    res.status(200).json({
      success: true,
      code: "{GOOGLE_FORM_CREATED_AND_UPDATED}",
      googleFormId: createFormResult.data.formId,
    });
  } catch (error) {}
};

const updateGoogleForm = async (req: Request, res: Response) => {};

export { createAndUpdateGoogleForm, updateGoogleForm };
