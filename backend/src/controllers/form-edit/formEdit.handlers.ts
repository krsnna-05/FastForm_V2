import { Request, Response } from "express";
import { appendFormStateMessage, resolveFormState } from "./formEdit.state";
import { agentQuery } from "./formEdit.streams";
import type { EditFormRequest } from "./formEdit.types";

const editForm = async (req: Request, res: Response) => {
  try {
    const { form, messages, formId, request, userId } =
      req.body as EditFormRequest;

    if (!formId) {
      res.status(400).json({ error: "Missing formId" });
      return;
    }

    const currentForm = await resolveFormState({
      request,
      formId,
      userId,
      fallbackForm: form,
    });

    if (!currentForm) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    const updatedMessages = appendFormStateMessage(messages, currentForm);
    await agentQuery(
      updatedMessages,
      res,
      formId,
      userId,
      currentForm,
      request === "create",
    );
  } catch (error) {
    console.error("Form edit error:", error);
    res.status(500).json({ error: "Failed to process form request" });
  }
};

export { editForm };
