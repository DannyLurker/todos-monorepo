import z from "zod";
import { TodoStatus } from "@repo/database/client";

const detailTodos = z.array(
  z.object({
    title: z.string().trim().min(3),
  }),
);

export const todoCreateSchema = z.object({
  title: z.string().trim().min(3),
  point: z.number().min(1),
  status: z.enum(Object.values(TodoStatus)),
  comment: z.string().trim().max(2000).optional(),
  assignedWorker: z.string().trim().min(3),
  detailTodos,
});

export type TodoCreateSchema = z.infer<typeof todoCreateSchema>;

export const todoUpdateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  point: z.number().min(1).optional(),
  status: z.enum(Object.values(TodoStatus)).optional(),
  comment: z.string().trim().max(2000).nullable().optional(),
  assignedWorker: z.string().trim().min(3).optional(),
  detailTodos: detailTodos.optional(),
});

export type TodoUpdateSchema = z.infer<typeof todoUpdateSchema>;
