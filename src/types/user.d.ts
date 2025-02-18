
export type UserStatus = "active" | "inactive";

export type UserRole = "Administrador" | "Técnico" | "Usuário";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  companies?: string[];
  checklists?: string[];
}
