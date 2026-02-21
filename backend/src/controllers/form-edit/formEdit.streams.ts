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
import FormModel from "../../models/Form";
import type { Form } from "../../types/Form.DB";

const agentQuery = async (
  messages: UIMessage[],
  res: Response,
  formId: string,
  userId: string,
  form: Form,
  allowUpsert: boolean,
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

        if (toolResult.type === "update_title") {
          updatedForm.title = toolResult.title;
        }

        if (toolResult.type === "update_description") {
          updatedForm.description = toolResult.description;
        }

        if (toolResult.type === "add_field") {
          updatedForm.fields.push(toolResult.field);
        }

        if (toolResult.type === "delete_field") {
          updatedForm.fields = updatedForm.fields.filter(
            (field) => field. !== toolResult.fieldId,
          );
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

    await FormModel.findByIdAndUpdate(formId, updatedForm, {
      new: true,
      upsert: allowUpsert,
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

export { agentQuery };
