import z from "zod";

export const OperationSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("update_title").describe("Update a form title"),
      title: z.string().describe("New form title"),
    })
    .describe("Update the form title"),
  z
    .object({
      type: z
        .literal("update_description")
        .describe("Update a form description"),
      description: z.string().describe("New form description"),
    })
    .describe("Update the form description"),
  z
    .object({
      type: z.literal("add_field").describe("Add a field to the form"),
      field: z.discriminatedUnion("fieldType", [
        z
          .object({
            fieldType: z.literal("text").describe("Single-line text field"),
            id: z.string().describe("Field id"),
            label: z.string().describe("Field label"),
            required: z.boolean().describe("Whether the field is required"),
            location: z.number().describe("Field position in the form"),
          })
          .describe("Text input field"),
        z
          .object({
            fieldType: z.literal("para").describe("Multi-line text field"),
            id: z.string().describe("Field id"),
            label: z.string().describe("Field label"),
            required: z.boolean().describe("Whether the field is required"),
            location: z.number().describe("Field position in the form"),
          })
          .describe("Paragraph input field"),
        z
          .object({
            fieldType: z.literal("radio").describe("Single choice field"),
            id: z.string().describe("Field id"),
            label: z.string().describe("Field label"),
            options: z.array(z.string()).min(1).describe("Selectable options"),
            required: z.boolean().describe("Whether the field is required"),
            location: z.number().describe("Field position in the form"),
          })
          .describe("Radio field"),
        z
          .object({
            fieldType: z.literal("checkbox").describe("Multiple choice field"),
            id: z.string().describe("Field id"),
            label: z.string().describe("Field label"),
            options: z.array(z.string()).min(1).describe("Selectable options"),
            required: z.boolean().describe("Whether the field is required"),
            location: z.number().describe("Field position in the form"),
          })
          .describe("Checkbox field"),
      ]),
    })
    .describe("Add a new field"),
]);
