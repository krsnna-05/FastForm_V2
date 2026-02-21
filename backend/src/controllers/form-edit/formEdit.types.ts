import type { UIMessage } from "ai";
import type { Form } from "../../types/Form.DB";

interface EditFormRequest {
  request: "create" | "edit";
  form: Form;
  messages: UIMessage[];
  formId?: string;
  userId: string;
}

export type { EditFormRequest };
