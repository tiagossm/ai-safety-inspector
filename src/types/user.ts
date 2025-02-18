
export type UserRole = "Administrador" | "Gerente" | "Técnico";

export type UserPermission = {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
};

export type UserActivity = {
  id: string;
  action: string;
  description: string;
  timestamp: string;
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  avatar_url?: string;
  role: UserRole;
  status: string;
  created_at?: string;
  last_activity?: string;
  companies?: string[];
  checklists?: string[];
  permissions?: UserPermission[];
  activities?: UserActivity[];
}

export const validateRole = (role: string | null): UserRole => {
  if (role === "Administrador" || role === "Gerente" || role === "Técnico") {
    return role;
  }
  return "Técnico";
};
