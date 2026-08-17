import { requireSession, jsonError } from "@/lib/api/helpers";

export async function getTenantSession() {
  return requireSession();
}

export { jsonError };
