import { Response } from "express";

const unauthorizedResponse = (res: Response, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

const authCodeRequiredResponse = (res: Response) => {
  return res.status(400).json({
    success: false,
    error: "auth_code_required",
  });
};

const invalidGrantResponse = (res: Response) => {
  return res.status(400).json({
    success: false,
    error: "invalid_grant",
    message: "Failed to exchange authorization code",
  });
};

const userCreationFailedResponse = (res: Response) => {
  return res.status(500).json({
    success: false,
    error: "user_creation_failed",
    message: "Failed to create user in the database",
  });
};

const userFetchFailedResponse = (res: Response) => {
  return res.status(500).json({
    success: false,
    error: "user_fetch_failed",
    message: "Failed to fetch user from the database",
  });
};

export {
  unauthorizedResponse,
  authCodeRequiredResponse,
  invalidGrantResponse,
  userCreationFailedResponse,
  userFetchFailedResponse,
};
