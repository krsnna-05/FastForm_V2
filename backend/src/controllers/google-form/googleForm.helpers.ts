import { z } from "zod";
import { createGoogleFormBodySchema } from "./googleForm.schema";

const parseCreateGoogleFormBody = (body: unknown) => {
  return createGoogleFormBodySchema.parse(body ?? {});
};

const isValidationError = (error: unknown): error is z.ZodError => {
  return error instanceof z.ZodError;
};

const isTransientNetworkError = (message: string) => {
  return /EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT|socket hang up/i.test(
    message,
  );
};

export {
  parseCreateGoogleFormBody,
  isValidationError,
  isTransientNetworkError,
};
