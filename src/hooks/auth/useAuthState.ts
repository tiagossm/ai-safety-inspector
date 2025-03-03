
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

// Interface estendida para o User
export interface AuthUser extends User {
  role?: "admin" | "user";
  tier?: "super_admin" | "company_admin" | "consultant" | "technician";
  company_id?: string;
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    user,
    setUser,
    loading,
    setLoading
  };
}
