import FormModel from "../../models/Form";
import googleFormService from "../../services/googleForm.service";

const createAndSyncGoogleForm = async ({
  userId,
  formId,
  form,
}: {
  userId: string;
  formId: string;
  form: {
    title: string;
    description?: string;
    fields: Array<{
      label: string;
      fieldType: "text" | "para" | "radio" | "checkbox";
      options?: string[];
      required: boolean;
      location: number;
    }>;
  };
}) => {
  const DBForm = await FormModel.findOne({ _id: formId, userId }).exec();

  if (!DBForm) {
    throw new Error("Form not found or access denied");
  }

  if (DBForm.googleFormId && DBForm.isSyncedWithGoogleForm) {
    throw new Error("Form is already connected to a Google Form");
  }

  const googleForm = new googleFormService(userId);

  const createFormResult = await googleForm
    .createGoogleForm({
      title: form.title,
      description: form.description,
    })
    .catch((error) => {
      throw new Error("Failed to create Google Form: " + error.message);
    });

  const updateFormResult = await googleForm.updateGoogleForm(
    createFormResult.data.formId!,
    form,
  );

  const googleFormId =
    updateFormResult.data.form?.formId || createFormResult.data.formId;
  const googleFormUrl = updateFormResult.data.form?.responderUri;

  await FormModel.findByIdAndUpdate(formId, {
    googleFormId,
    googleFormUrl,
    isSyncedWithGoogleForm: true,
  }).exec();

  return {
    googleFormId,
    googleFormUrl,
  };
};

export { createAndSyncGoogleForm };
