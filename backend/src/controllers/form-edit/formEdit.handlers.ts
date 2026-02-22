import { Request, Response } from "express";
import { appendFormStateMessage, resolveFormState } from "./formEdit.state";
import { agentQuery } from "./formEdit.streams";
import type { EditFormRequest } from "./formEdit.types";
import { Form } from "../../types/Form.DB";

const editForm = async (req: Request, res: Response) => {
  try {
    const { form, messages, formId, userId } = req.body as EditFormRequest;

    if (!formId || !userId || messages.length === 0 || !form) {
      res.status(400).json({ error: "Invalid Request" });
      return;
    }

    const currForm = form as Form;

    console.log("Form Received for Edit:", currForm);

    const updatedMessages = appendFormStateMessage(messages, currForm);
    await agentQuery(updatedMessages, res, formId, userId, currForm);
  } catch (error) {
    console.error("Form edit error:", error);
    res.status(500).json({ error: "Failed to process form request" });
  }
};

export { editForm };
