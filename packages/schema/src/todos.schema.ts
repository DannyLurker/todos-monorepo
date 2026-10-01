import z from "zod";
import { TodoStatus } from "@repo/database";

const detailTodos = z.array(
  z.object({
    title: z.string().trim().min(3),
  }),
);

export const todoCreateSchema = z.object({
  title: z.string().trim().min(3),
  point: z.number().min(1),
  status: z.enum(Object.values(TodoStatus)),
  assignedWorker: z.string().trim().min(3),
  detailTodos,
});

export type TodoCreateSchema = z.infer<typeof todoCreateSchema>;
