import { tool } from "ai";
import z from "zod";

/* ------------------ UPDATE TITLE ------------------ */

export const updateTitleTool = tool({
  description: "Update the form title",
  inputSchema: z.object({
    title: z.string(),
  }),
  execute: async ({ title }) => {
    return { type: "update_title", title };
  },
});

/* ------------------ UPDATE DESCRIPTION ------------------ */

export const updateDescriptionTool = tool({
  description: "Update the form description",
  inputSchema: z.object({
    description: z.string(),
  }),
  execute: async ({ description }) => {
    return { type: "update_description", description };
  },
});

/* ------------------ ADD FIELD (SIMPLIFIED) ------------------ */

export const addFieldTool = tool({
  description:
    "Add a new field to the form. fieldType must be one of: text, para, radio, checkbox.",
  inputSchema: z.object({
    id: z.string(),
    fieldType: z.enum(["text", "para", "radio", "checkbox"]), // text | para | radio | checkbox
    label: z.string(),
    required: z.boolean(),
    options: z
      .array(z.string())
      .optional()
      .describe("only use when field type is radio and checkbox only"), // only for radio/checkbox
    location: z.number(),
  }),
  execute: async (input) => {
    return {
      type: "add_field",
      field: input,
    };
  },
});

/* ------------------ UPDATE FIELD (SIMPLIFIED) ------------------ */

export const updateFieldTool = tool({
  description:
    "Update an existing field in the form. fieldType must be one of: text, para, radio, checkbox.",
  inputSchema: z.object({
    index: z.number(),
    id: z.string(),
    fieldType: z.string(), // text | para | radio | checkbox
    label: z.string(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  }),
  execute: async ({ id, index, ...field }) => {
    return {
      id,
      type: "update_field",
      index,
      field,
    };
  },
});

/* ------------------ DELETE FIELD ------------------ */

export const deleteFieldTool = tool({
  description: "Delete a field from the form by index",
  inputSchema: z.object({
    id: z.string().describe("ID of the field to delete"),
    index: z.number(),
  }),
  execute: async ({ id, index }) => {
    return {
      id,
      type: "delete_field",
      index,
    };
  },
});

/* ------------------ MOVE FIELD ------------------ */

export const moveFieldTool = tool({
  description: "Move a field from one index to another",
  inputSchema: z.object({
    id: z.string().describe("ID of the field to move"),
    fromIndex: z.number(),
    toIndex: z.number(),
  }),
  execute: async ({ id, fromIndex, toIndex }) => {
    return {
      id,
      type: "move_field",
      fromIndex,
      toIndex,
    };
  },
});
