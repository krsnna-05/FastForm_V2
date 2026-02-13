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

  const formAgent = new ToolLoopAgent({
    model: ollama("ministral-3:3b"),
    stopWhen: stepCountIs(20),
    instructions: prompts.agent,
    temperature: 0,
    tools: {
      update_title: tool({
        description: "Update the form title",
        inputSchema: z.object({
          title: z.string(),
        }),
        execute: async ({ title }) => {
          const operation = { type: "update_title", title };
          return operation;
        },
      }),

      update_description: tool({
        description: "Update the form description",
        inputSchema: z.object({
          description: z.string(),
        }),
        execute: async ({ description }) => {
          const operation = { type: "update_description", description };
          return operation;
        },
      }),

      update_text_field: tool({
        description: "Add or update a single-line text field",
        inputSchema: z.object({
          id: z.string(),
          new: z.boolean(),
          label: z.string(),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: { fieldType: "text", ...input },
          };
          return operation;
        },
      }),

      update_para_field: tool({
        description: "Add or update a multi-line paragraph field",
        inputSchema: z.object({
          id: z.string(),
          new: z.boolean(),
          label: z.string(),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: { fieldType: "para", ...input },
          };
          return operation;
        },
      }),

      update_radio_field: tool({
        description: "Add or update a radio field",
        inputSchema: z.object({
          id: z.string(),
          new: z.boolean(),
          label: z.string(),
          options: z.array(z.string()).min(1),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: { fieldType: "radio", ...input },
          };
          return operation;
        },
      }),

      update_checkbox_field: tool({
        description: "Add or update a checkbox field",
        inputSchema: z.object({
          id: z.string(),
          new: z.boolean(),
          label: z.string(),
          options: z.array(z.string()).min(1),
          required: z.boolean(),
          location: z.number(),
        }),
        execute: async (input) => {
          const operation = {
            type: "add_field",
            field: { fieldType: "checkbox", ...input },
          };
          return operation;
        },
      }),
      done: tool({
        description: "Finish building the form",
        inputSchema: z.object({
          message: z
            .string()
            .describe("A Human like final message to the user upon completion"),
        }),
        execute: async ({ message }) => {
          console.log("Agent finished.");
          return { type: "done", message };
        },
      }),
    },
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const agentStream = await formAgent.stream({
        messages: await convertToModelMessages(messages),
      });

      let doneCalled = false;

      for await (const event of agentStream.fullStream) {
        if (event.type === "tool-result") {
          const toolResult: any = event.output;
          console.log("Tool result:", toolResult);
          res.write(JSON.stringify(toolResult) + "\n");

          if (toolResult.type === "done") {
            doneCalled = true;
          }
        }
      }

      // If agent finished without calling done, send a default completion message
      if (!doneCalled) {
        const doneResult = {
          type: "done",
          message: "Form created successfully!",
        };
        console.log(
          "Agent finished without calling done. Sending default:",
          doneResult,
        );
        res.write(JSON.stringify(doneResult) + "\n");
      }

      res.end();
    },
  });
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
