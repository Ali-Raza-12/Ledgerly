import { supabase } from "@/lib/supabaseClient";

const MISSING_USER_SCOPE_CODE = "42703";

interface ErrorLike {
  code?: string;
  message?: string;
}

export async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("You must be signed in to access finance data.");
  }

  return data.user.id;
}

export function mapUserScopeError<T extends ErrorLike | null>(error: T): T | Error {
  if (!error) {
    return error;
  }

  if (
    error.code === MISSING_USER_SCOPE_CODE ||
    (typeof error.message === "string" && error.message.includes("user_id does not exist"))
  ) {
    return new Error("Please set up user-specific data access.");
  }

  return error;
}

export function getBudgetStorageKey(userId: string) {
  return `monthly-budgets:${userId}`;
}
