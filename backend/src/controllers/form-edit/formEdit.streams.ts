import { convertToModelMessages, ToolLoopAgent, stepCountIs } from "ai";
import type { UIMessage } from "ai";
import { ollama } from "ai-sdk-ollama";
import { Response } from "express";
import prompts from "../../prompts.json";
import {
  addFieldTool,
  deleteFieldTool,
  updateDescriptionTool,
  updateTitleTool,
} from "../../ai.tools";
import type { Form } from "../../types/Form.DB";
import { applyToolAction } from "./formEdit.utils";

const agentQuery = async (
  messages: UIMessage[],
  res: Response,
  formId: string,
  userId: string,
  form: Form,
) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  console.log();
  console.log("Starting agent stream with messages:", messages);
  console.log();

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
        delete_field: deleteFieldTool,
      },
    });

    const agentStream = await formAgent.stream({
      messages: await convertToModelMessages(messages),
    });

    let finalText = "";

    const updatedForm: Form = {
      ...form,
      _id: formId,
      userId,
    };

    for await (const event of agentStream.fullStream) {
      if (event.type === "tool-result") {
        const toolResult: any = event.output;

        try {
          const newForm = applyToolAction(updatedForm, toolResult);

          // Mutate safely after validation
          updatedForm.title = newForm.title;
          updatedForm.description = newForm.description;
          updatedForm.fields = newForm.fields;

          console.log("Form safely updated:", updatedForm);

          res.write(JSON.stringify(toolResult) + "\n");
        } catch (err: any) {
          console.error("Tool action rejected:", err.message);

          res.write(
            JSON.stringify({
              type: "tool_error",
              message: err.message,
            }) + "\n",
          );
        }
      }

      if (event.type === "text-delta") {
        console.log("Text delta received:", event.text);

        res.write(
          JSON.stringify({
            type: "assistant_text",
            text: event.text,
          }) + "\n",
        );

        finalText += event.text;
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

export { agentQuery };
