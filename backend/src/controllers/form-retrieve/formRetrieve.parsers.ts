import { Request } from "express";

const parseUserId = (req: Request) => {
  return typeof req.query.userId === "string" ? req.query.userId : "";
};

const parsePagination = (req: Request) => {
  const pageParam = typeof req.query.page === "string" ? req.query.page : "1";
  const limitParam =
    typeof req.query.limit === "string" ? req.query.limit : "10";

  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const parseUserIdAndFormId = async (req: Request) => {
  const { formId } = req.params;
  const userId = parseUserId(req);

  if (!formId || typeof formId !== "string") {
    throw new Error("Missing or invalid formId");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("Unauthorized: Missing user information");
  }

  return { formId, userId };
};
export { parseUserId, parsePagination, parseUserIdAndFormId };
