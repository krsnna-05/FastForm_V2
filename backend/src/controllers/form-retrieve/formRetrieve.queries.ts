import FormModel from "../../models/Form";
import { Form } from "../../types/Form.DB";

const getPaginatedForms = async ({
  userId,
  skip,
  limit,
}: {
  userId: string;
  skip: number;
  limit: number;
}) => {
  const [forms, total] = await Promise.all([
    FormModel.find({ userId })
      .select({ _id: 1, title: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    FormModel.countDocuments({ userId }).exec(),
  ]);

  return {
    forms,
    total,
  };
};

const getFormForUser = async ({
  formId,
  userId,
}: {
  formId: string;
  userId: string;
}) => {
  const query = userId ? { _id: formId, userId } : { _id: formId };
  return FormModel.findOne(query).lean().exec();
};

const checkFormExistsForUser = async ({
  formId,
  userId,
}: {
  formId: string;
  userId: string;
}) => {
  const count = await FormModel.countDocuments({ _id: formId, userId }).exec();
  return count > 0;
};

const createFormForUserById = async (formId: string, userId: string) => {
  try {
    const defaultForm: Form = {
      _id: formId,
      userId: userId,
      title: "Untitled Form",
      description: "",
      fields: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isSyncedWithGoogleForm: false,
    };

    const existingForm = await getFormForUser({ formId, userId });

    if (existingForm) {
      throw new Error("Form with this ID already exists for the user");
    }

    const newForm = new FormModel(defaultForm);

    newForm.isNew = true;

    await newForm.save();

    return newForm.toObject();
  } catch (error) {
    return error;
  }
};

export {
  getPaginatedForms,
  getFormForUser,
  createFormForUserById,
  checkFormExistsForUser,
};
