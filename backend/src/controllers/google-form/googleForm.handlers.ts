import { Request, Response } from "express";
import {
  isTransientNetworkError,
  isValidationError,
  parseCreateGoogleFormBody,
} from "./googleForm.helpers";
import { createAndSyncGoogleForm } from "./googleForm.workflow";

const createAndUpdateGoogleForm = async (req: Request, res: Response) => {
  let parsedBody;

  try {
    parsedBody = parseCreateGoogleFormBody(req.body);
  } catch (error) {
    if (isValidationError(error)) {
      return res.status(400).json({
        success: false,
        errors: error.issues,
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }

  try {
    const { userId, formId, form } = parsedBody;

    const result = await createAndSyncGoogleForm({ userId, formId, form });

    res.status(200).json({
      success: true,
      code: "{GOOGLE_FORM_CREATED_AND_UPDATED}",
      googleFormId: result.googleFormId,
      googleFormUrl: result.googleFormUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Google Form";

    const transientError = isTransientNetworkError(message);

    return res.status(transientError ? 503 : 500).json({
      success: false,
      message: transientError
        ? "Failed to reach Google Forms API (temporary DNS/network issue). Please retry in a moment."
        : message,
    });
  }
};

const updateGoogleForm = async (req: Request, res: Response) => {};

export { createAndUpdateGoogleForm, updateGoogleForm };
