
export enum UserRole {
  ADMIN = "Admin",
  TECHNICIAN = "Técnico",
  USER = "Usuário"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: UserRole;
  status: UserStatus;
  lastActivity?: string;
  createdAt: string;
};
