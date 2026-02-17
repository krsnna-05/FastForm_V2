import { z } from "zod";
import { Request, Response } from "express";
import googleFormService from "../services/googleForm.service";
import FormModel from "../models/Form";

const bodySchema = z.object({
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

const createAndUpdateGoogleForm = async (req: Request, res: Response) => {
  let parsedBody;

  try {
    parsedBody = bodySchema.parse(req.body ?? {});
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
    const { userId, formId, form } = parsedBody;

    const DBForm = await FormModel.findOne({ _id: formId, userId }).exec();

    if (!DBForm) {
      throw new Error("Form not found or access denied");
    }

    if (DBForm.googleFormId && DBForm.isSyncedWithGoogleForm) {
      throw new Error("Form is already connected to a Google Form");
    }

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

    await FormModel.findByIdAndUpdate(formId, {
      googleFormId:
        updateFormResult.data.form?.formId || createFormResult.data.formId,
      googleFormUrl: updateFormResult.data.form?.responderUri,
      isSyncedWithGoogleForm: true,
    }).exec();

    res.status(200).json({
      success: true,
      code: "{GOOGLE_FORM_CREATED_AND_UPDATED}",
      googleFormId:
        updateFormResult.data.form?.formId || createFormResult.data.formId,
      googleFormUrl: updateFormResult.data.form?.responderUri,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Google Form";

    const isTransientNetworkError =
      /EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT|socket hang up/i.test(message);

    return res.status(isTransientNetworkError ? 503 : 500).json({
      success: false,
      message: isTransientNetworkError
        ? "Failed to reach Google Forms API (temporary DNS/network issue). Please retry in a moment."
        : message,
    });
  }
};

const updateGoogleForm = async (req: Request, res: Response) => {};

export { createAndUpdateGoogleForm, updateGoogleForm };
