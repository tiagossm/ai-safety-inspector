
export type UserRole = "Administrador" | "Gerente" | "Técnico";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  companies?: string[];
  checklists?: string[];
}

export const validateRole = (role: string | null): UserRole => {
  if (role === "Administrador" || role === "Gerente" || role === "Técnico") {
    return role;
  }
  return "Técnico";
};
