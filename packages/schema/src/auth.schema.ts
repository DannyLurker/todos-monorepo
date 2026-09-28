import z from "zod";

export const emailCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type EmailCredentialsSchema = z.infer<typeof emailCredentialsSchema>;
