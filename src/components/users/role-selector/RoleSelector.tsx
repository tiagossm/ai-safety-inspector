import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";

const roleLabels = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.TECHNICIAN]: "Técnico",
  [UserRole.USER]: "Usuário",
};

export const RoleSelector = ({
  selectedRole,
  onSelect,
}: {
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {roleLabels[selectedRole]}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-[200px]">
        <div className="space-y-1">
          {Object.values(UserRole).map((role) => (
            <Button
              key={role}
              variant="ghost"
              className="w-full justify-between"
              onClick={() => onSelect(role)}
            >
              {roleLabels[role]}
              {selectedRole === role && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};