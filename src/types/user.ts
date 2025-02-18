
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
  email_secondary?: string;
  phone?: string;
  phone_secondary?: string;
  cpf?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at?: string;
};
