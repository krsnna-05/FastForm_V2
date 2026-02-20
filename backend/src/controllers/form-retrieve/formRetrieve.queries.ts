import FormModel from "../../models/Form";

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

export { getPaginatedForms, getFormForUser };
