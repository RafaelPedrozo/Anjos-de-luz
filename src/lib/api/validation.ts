import type { ZodError } from "zod";

export function zodFirstError(error: ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos";
}
