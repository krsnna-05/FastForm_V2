import { Request, Response } from "express";
import FormModel from "../models/Form";

const getForms = async (req: Request, res: Response) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : "";

    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }

    const pageParam = typeof req.query.page === "string" ? req.query.page : "1";
    const limitParam =
      typeof req.query.limit === "string" ? req.query.limit : "10";

    const page = Math.max(parseInt(pageParam, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      FormModel.find({ userId })
        .select({ _id: 1, title: 1, updatedAt: 1 })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      FormModel.countDocuments({ userId }).exec(),
    ]);

    res.json({
      data: forms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};

const getFormById = async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const userId = typeof req.query.userId === "string" ? req.query.userId : "";

    if (!formId) {
      res.status(400).json({ error: "Missing formId" });
      return;
    }

    const query = userId ? { _id: formId, userId } : { _id: formId };
    const form = await FormModel.findOne(query).lean().exec();

    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }

    res.json({ data: form });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ error: "Failed to fetch form" });
  }
};

export { getForms, getFormById };
