import {
  convertToModelMessages,
  streamText,
  ToolLoopAgent,
  stepCountIs,
  tool,
  createUIMessageStream,
} from "ai";
import { ollama } from "ai-sdk-ollama";
import { Request, Response } from "express";
import type { Form } from "../types/Form.DB";
import type { UIMessage } from "ai";
import prompts from "../prompts.json";
import z from "zod";
import {
  addFieldTool,
  deleteFieldTool,
  moveFieldTool,
  updateDescriptionTool,
  updateFieldTool,
  updateTitleTool,
} from "../ai.tools";

interface EditFormRequest {
  request: "create_form" | "edit_form";
  form: Form;
  messages: UIMessage[];
  aiMode?: "ask" | "agent";
  mode?: "ask" | "agent";
}

const askQuery = async (messages: UIMessage[], res: Response) => {
  const result = streamText({
    model: ollama("ministral-3:3b"),
    messages: await convertToModelMessages(messages),
    system: prompts.ask,
  });
  result.pipeUIMessageStreamToResponse(res);
};

const agentQuery = async (messages: UIMessage[], res: Response) => {
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

    console.log("Starting agent stream with messages:", messages);

    const agentStream = await formAgent.stream({
      messages: await convertToModelMessages(messages),
    });

    let finalText = "";

    for await (const event of agentStream.fullStream) {
      if (event.type === "tool-result") {
        const toolResult = event.output;
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
    const { form, messages, aiMode, mode } = req.body as EditFormRequest;
    const resolvedMode = aiMode ?? mode ?? "agent";

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
      await agentQuery(updatedMessages, res);
      return;
    }

    if (resolvedMode === "ask") {
      await askQuery(messages, res);
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
