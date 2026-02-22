import type { Form } from "../../types/Form.DB";

type ToolResult =
  | { type: "update_title"; title: string }
  | { type: "update_description"; description: string }
  | { type: "add_field"; field: any }
  | { type: "delete_field"; id: string };

export function normalizeLocations(fields: Form["fields"]) {
  return fields.map((field, index) => ({
    ...field,
    location: index,
  }));
}

export function applyToolAction(form: Form, action: ToolResult): Form {
  switch (action.type) {
    case "update_title":
      return {
        ...form,
        title: action.title,
      };

    case "update_description":
      return {
        ...form,
        description: action.description,
      };

    case "add_field": {
      // Prevent duplicate IDs
      if (form.fields.some((f) => f.id === action.field.id)) {
        throw new Error(`Field with id "${action.field.id}" already exists.`);
      }

      const updatedFields = normalizeLocations([...form.fields, action.field]);

      return {
        ...form,
        fields: updatedFields,
      };
    }

    case "delete_field": {
      const exists = form.fields.some((f) => f.id === action.id);

      if (!exists) {
        throw new Error(`Field with id "${action.id}" does not exist.`);
      }

      const updatedFields = normalizeLocations(
        form.fields.filter((f) => f.id !== action.id),
      );

      return {
        ...form,
        fields: updatedFields,
      };
    }

    default:
      throw new Error("Unknown tool action type");
  }
}
