
import { createContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  role: "admin" | "user";
  tier?: "super_admin" | "company_admin" | "consultant" | "technician";
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  logout: async () => {} 
});
