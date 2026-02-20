import { Request, Response } from "express";
import { parsePagination, parseUserId } from "./formRetrieve.parsers";
import { getFormForUser, getPaginatedForms } from "./formRetrieve.queries";

const getForms = async (req: Request, res: Response) => {
  try {
    const userId = parseUserId(req);

    if (!userId) {
      res.status(400).json({ error: "Missing userId" });
      return;
    }

    const { page, limit, skip } = parsePagination(req);
    const { forms, total } = await getPaginatedForms({ userId, skip, limit });

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
    const userId = parseUserId(req);

    if (!formId) {
      res.status(400).json({ error: "Missing formId" });
      return;
    }

    const form = await getFormForUser({ formId, userId });

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
