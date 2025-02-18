
import { Badge } from "@/components/ui/badge";
import { Crown, Users2, Wrench } from "lucide-react";
import { roleInfo } from "./RoleInfo";
import { UserRole } from "@/types/user";

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const getRoleIcon = (role: UserRole) => {
  const color = roleInfo[role].iconColor;
  switch (role) {
    case "Administrador":
      return <Crown className={`h-5 w-5 text-${color}-500`} />;
    case "Gerente":
      return <Users2 className={`h-5 w-5 text-${color}-500`} />;
    case "Técnico":
      return <Wrench className={`h-5 w-5 text-${color}-500`} />;
  }
};

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="grid gap-4">
      {(Object.entries(roleInfo) as [UserRole, typeof roleInfo[UserRole]][]).map(([role, info]) => (
        <div
          key={role}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            selectedRole === role 
              ? 'border-primary bg-accent' 
              : 'border-transparent hover:border-muted-foreground'
          }`}
          onClick={() => onRoleChange(role)}
        >
          <div className="flex items-center gap-2 mb-2">
            {getRoleIcon(role)}
            <h3 className="font-medium">{role}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {info.description}
          </p>
          <div className="space-y-2">
            {info.permissions.map((permission, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Badge variant={selectedRole === role ? "default" : "secondary"} className="h-1.5 w-1.5 rounded-full p-0" />
                {permission}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
