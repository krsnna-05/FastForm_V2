import { Request } from "express";

const parseBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  return authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : authorizationHeader;
};

const parseOAuthCode = (req: Request): string | null => {
  if (typeof req.query.code === "string") {
    return req.query.code;
  }

  if (typeof req.body?.code === "string") {
    return req.body.code;
  }

  return null;
};

export { parseBearerToken, parseOAuthCode };
