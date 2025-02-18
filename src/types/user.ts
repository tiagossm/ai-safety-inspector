
export type UserRole = "Administrador" | "Gerente" | "Técnico";

export interface User {
  id: string;
  name: string;
  cpf?: string;
  email: string;
  emailSecondary?: string;
  phone?: string;
  phoneSecondary?: string;
  roles: string[];
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
