import { ZodError } from "zod";

export class AppError extends Error {
  constructor(statusCode, message, fields) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
    this.name = "AppError";
  }
}

function zodToFields(err) {
  /** @type {Record<string, string>} */
  const fields = {};
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed",
      fields: zodToFields(err),
    });
  }

  if (err instanceof AppError) {
    const body = { error: err.message };
    if (err.fields && Object.keys(err.fields).length) {
      body.fields = err.fields;
    }
    return res.status(err.statusCode).json(body);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
