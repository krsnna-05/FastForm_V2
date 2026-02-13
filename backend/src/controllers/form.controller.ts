import {
  convertToModelMessages,
  createUIMessageStream,
  Output,
  streamText,
  ToolLoopAgent,
  stepCountIs,
  tool,
} from "ai";
import { ollama } from "ai-sdk-ollama";
import { Request, Response } from "express";
import type { Form } from "../types/Form.DB";
import type { UIMessage } from "ai";
import prompts from "../prompts.json";
import { OperationSchema } from "../types/Operation";
import z from "zod";

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

const agentQuery = async (messages: UIMessage[]) => {
  const formAgent = new ToolLoopAgent({
    model: ollama("ministral-3:3b"),

    // Safety limit
    stopWhen: stepCountIs(20),

    tools: {
      update_title: tool({
        description: "Update the form title",
        inputSchema: z.object({
          title: z.string(),
        }),
        execute: async ({ title }) => {
          const operation = {
            type: "update_title",
            title,
          };

          console.log("Operation:", operation);
          return operation;
        },
      }),

      update_description: tool({
        description: "Update the form description",
        inputSchema: z.object({
          description: z.string(),
        }),
        execute: async ({ description }) => {
          const operation = {
            type: "update_description",
            description,
          };

          console.log("Operation:", operation);
          return operation;
        },
      }),

      update_text_field: tool({
        description: "Add a single-line text field",
        inputSchema: z.object({
          id: z.string(),
          new: z
            .boolean()
            .describe(
              "Whether this is a new field or an update to an existing field",
            ),
          label: z.string(),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: {
              fieldType: "text",
              ...input,
            },
          };

          console.log("Operation:", operation);
          return operation;
        },
      }),
      update_para_field: tool({
        description: "Add a multi-line paragraph field",
        inputSchema: z.object({
          id: z.string(),
          new: z
            .boolean()
            .describe(
              "Whether this is a new field or an update to an existing field",
            ),
          label: z.string(),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: {
              fieldType: "para",
              ...input,
            },
          };

          console.log("Operation:", operation);
          return operation;
        },
      }),
      update_radio_field: tool({
        description: "Add a single choice radio field",
        inputSchema: z.object({
          id: z.string(),
          new: z
            .boolean()
            .describe(
              "Whether this is a new field or an update to an existing field",
            ),
          label: z.string(),
          options: z.array(z.string()).min(1),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: {
              fieldType: "radio",
              ...input,
            },
          };

          console.log("Operation:", operation);
          return operation;
        },
      }),

      update_checkbox_field: tool({
        description: "Add a multiple choice checkbox field",
        inputSchema: z.object({
          id: z.string(),
          new: z
            .boolean()
            .describe(
              "Whether this is a new field or an update to an existing field",
            ),
          label: z.string(),
          options: z.array(z.string()).min(1),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: {
              fieldType: "checkbox",
              ...input,
            },
          };

          console.log("Operation:", operation);
          return operation;
        },
      }),

      done: tool({
        description: "Finish building the form",
        inputSchema: z.object({}),
        execute: async () => {
          console.log("Agent finished.");
          return { type: "done" };
        },
      }),
    },
  });

  const result = await formAgent.generate({
    messages: await convertToModelMessages(messages),
  });

  console.log("Final Agent Text Output:", result.text);
  console.log("Steps Taken:", result.steps.length);
};

const editForm = async (req: Request, res: Response) => {
  try {
    const { request, form, messages, aiMode, mode } =
      req.body as EditFormRequest;
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

    if (request === "create_form" && resolvedMode === "agent") {
      await agentQuery(updatedMessages);
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
