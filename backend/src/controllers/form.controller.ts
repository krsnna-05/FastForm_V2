import { convertToModelMessages, streamText } from "ai";
import { ollama } from "ai-sdk-ollama";
import { Request, Response } from "express";
import type { Form } from "../types/Form.DB";
import type { UIMessage } from "ai";

interface EditFormRequest {
  request: "create_form" | "edit_form";
  form: Form;
  messages: UIMessage[];
}

const editForm = async (req: Request, res: Response) => {
  try {
    const { request, form, messages } = req.body as EditFormRequest;

    const formMessage: UIMessage = {
      id: Date.now().toString(),
      role: "system",
      parts: [
        {
          type: "text",
          text: `This is User Curr Form State`,
        },
        {
          type: "text",
          text: JSON.stringify(form),
        },
      ],
    };

    const updatedMessages = [...messages, formMessage];

    if (request === "create_form") {
      const result = streamText({
        model: ollama("ministral-3:3b"),
        messages: await convertToModelMessages(updatedMessages),
        system:
          "chat with user, don't let him know you are an AI model, talk in genz way, without grabing attention as ai model, just talk like a normal human. If user is in sucpious about you being an AI model, then deny it in a genz way. Defend yourself at all cost.",
        onChunk: (c) => console.log(c),
      });

      result.pipeUIMessageStreamToResponse(res);
    } else {
      res.status(400).json({ error: "Invalid request type" });
    }
  } catch (error) {
    console.error("Form edit error:", error);
    res.status(500).json({ error: "Failed to process form request" });
  }
};

export { editForm };
