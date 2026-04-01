import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");

const taskStatus = z.enum(["todo", "in_progress", "done"], {
  errorMap: () => ({ message: "Invalid status" }),
});

const taskPriority = z.enum(["low", "medium", "high"], {
  errorMap: () => ({ message: "Invalid priority" }),
});

const optionalIsoDate = z
  .union([
    z
      .string()
      .datetime({
        offset: true,
        message: "dueDate must be a valid ISO 8601 datetime",
      }),
    z.literal(""),
    z.null(),
  ])
  .optional();

function normalizeDueDate(val) {
  if (val === "" || val === null || val === undefined) return undefined;
  return val;
}

export const taskCreateSchema = z
  .object({
    title: z
      .string({ required_error: "title is required" })
      .trim()
      .min(1, "title is required")
      .max(200, "title must be at most 200 characters"),
    description: z
      .union([
        z.string().max(2000, "description must be at most 2000 characters"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((v) =>
        v === "" || v === undefined || v === null ? undefined : v,
      ),
    status: taskStatus.default("todo"),
    priority: taskPriority.default("medium"),
    dueDate: optionalIsoDate.transform(normalizeDueDate),
    assignedTo: uuid.optional(),
  })
  .strict();

export const taskUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "title cannot be empty")
      .max(200, "title must be at most 200 characters")
      .optional(),
    description: z
      .union([
        z.string().max(2000, "description must be at most 2000 characters"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((v) => (v === "" ? null : v)),
    status: taskStatus.optional(),
    priority: taskPriority.optional(),
    dueDate: optionalIsoDate.transform(normalizeDueDate),
    assignedTo: z.union([uuid, z.null()]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
    path: ["_root"],
  });

const sortFields = [
  "title",
  "status",
  "priority",
  "due_date",
  "created_at",
  "updated_at",
];

export const taskListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: taskStatus.optional(),
    priority: taskPriority.optional(),
    assignedTo: uuid.optional(),
    sortBy: z.enum(sortFields).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((s) => (s === "" ? undefined : s)),
  })
  .strict();

export const idParamSchema = z.object({ id: uuid });
