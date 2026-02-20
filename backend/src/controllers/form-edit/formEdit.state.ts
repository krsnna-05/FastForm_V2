import type { UIMessage } from "ai";
import FormModel from "../../models/Form";
import type { Form } from "../../types/Form.DB";

const resolveFormState = async ({
  request,
  formId,
  userId,
  fallbackForm,
}: {
  request: "create" | "edit";
  formId: string;
  userId: string;
  fallbackForm: Form;
}) => {
  let currentForm = fallbackForm;

  if (request === "create") {
    const newForm = new FormModel({
      _id: formId,
      userId,
      title: "Untitled Form",
      description: "",
      fields: [],
    });
    await newForm.save();
    currentForm = newForm.toObject();
  } else if (request === "edit") {
    const existingForm = await FormModel.findById(formId).exec();

    if (!existingForm) {
      return null;
    }

    currentForm = existingForm.toObject();
  }

  return currentForm;
};

const appendFormStateMessage = (messages: UIMessage[], currentForm: Form) => {
  const formMessage: UIMessage = {
    id: Date.now().toString(),
    role: "system",
    parts: [
      {
        type: "text",
        text: "This is User Curr Form State",
      },
      {
        type: "text",
        text: JSON.stringify(currentForm),
      },
    ],
  };

  return [...messages, formMessage];
};

export { resolveFormState, appendFormStateMessage };
