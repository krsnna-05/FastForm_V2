import {
  convertToModelMessages,
  streamText,
  ToolLoopAgent,
  stepCountIs,
} from "ai";
import { ollama } from "ai-sdk-ollama";
import { Request, Response } from "express";
import type { Form } from "../types/Form.DB";
import type { UIMessage } from "ai";
import prompts from "../prompts.json";
import {
  addFieldTool,
  deleteFieldTool,
  moveFieldTool,
  updateDescriptionTool,
  updateFieldTool,
  updateTitleTool,
} from "../ai.tools";
import FormModel from "../models/Form";

interface EditFormRequest {
  request: "create" | "edit";
  form: Form;
  messages: UIMessage[];
  aiMode?: "ask" | "agent";
  mode?: "ask" | "agent";
  formId?: string;
  userId: string;
}

const askQuery = async (messages: UIMessage[], res: Response) => {
  const result = streamText({
    model: ollama("ministral-3:3b"),
    messages: await convertToModelMessages(messages),
    system: prompts.ask,
  });
  result.pipeUIMessageStreamToResponse(res);
};

const agentQuery = async (
  messages: UIMessage[],
  res: Response,
  formId: string,
  userId: string,
  form: Form,
) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const formAgent = new ToolLoopAgent({
      model: ollama("ministral-3:3b"),
      stopWhen: stepCountIs(30),
      instructions: prompts.agent,
      temperature: 0,
      tools: {
        update_title: updateTitleTool,
        update_description: updateDescriptionTool,
        add_field: addFieldTool,
        update_field: updateFieldTool,
        delete_field: deleteFieldTool,
        move_field: moveFieldTool,
      },
    });

    const agentStream = await formAgent.stream({
      messages: await convertToModelMessages(messages),
    });

    let finalText = "";

    let updatedForm: Form = {
      _id: formId,
      userId: userId,
      title: "",
      description: "",
      fields: [],
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };

    for await (const event of agentStream.fullStream) {
      if (event.type === "tool-result") {
        const toolResult: any = event.output;

        if (toolResult.type === "update_title") {
          updatedForm.title = toolResult.title;
        }

        if (toolResult.type === "update_description") {
          updatedForm.description = toolResult.description;
        }

        if (toolResult.type === "add_field") {
          updatedForm.fields.push(toolResult.field);
        }

        res.write(JSON.stringify(toolResult) + "\n");
      }

      if (event.type === "text-delta") {
        finalText += event.text;

        res.write(
          JSON.stringify({
            type: "assistant_text",
            delta: event.text,
          }) + "\n",
        );
      }
    }

    console.log("Final updated form from agent:", updatedForm);

    await FormModel.findByIdAndUpdate(formId, updatedForm, {
      new: true,
      upsert: true,
    });

    res.write(
      JSON.stringify({
        type: "done",
        message: finalText.trim() || "Form updated successfully.",
      }) + "\n",
    );

    res.end();
  } catch (error) {
    console.error("Agent streaming error:", error);

    res.write(
      JSON.stringify({
        type: "done",
        message: "Form updated with some issues. Please review changes.",
      }) + "\n",
    );

    res.end();
  }
};

const editForm = async (req: Request, res: Response) => {
  try {
    const { form, messages, aiMode, formId, request, userId } =
      req.body as EditFormRequest;
    const resolvedMode = aiMode ?? "agent";

    console.log("Received form edit request:", {
      form,
      formId: formId,
      title: form.title,
      aiMode: resolvedMode,
    });

    if (request === "create") {
      const newForm = new FormModel({
        _id: formId,
        userId: userId,
        title: "Untitled Form",
        description: "",
        fields: [],
      });
      await newForm.save();
    }

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

    if (resolvedMode === "agent") {
      await agentQuery(updatedMessages, res, formId!, userId, form);
      return;
    }

    if (resolvedMode === "ask") {
      await askQuery(updatedMessages, res);
      return;
    }

    {
      res.status(400).json({ error: "Invalid request type" });
    }
  } catch (error) {
    console.error("Form edit error:", error);
    res.status(500).json({ error: "Failed to process form request" });
  }
};

export { editForm };
