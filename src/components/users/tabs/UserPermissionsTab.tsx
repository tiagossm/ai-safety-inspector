
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPermission, UserRole } from "@/types/user";
import { RoleSelector } from "../role-selector/RoleSelector";

const defaultModules = [
  { name: "Empresas", key: "companies" },
  { name: "Usuários", key: "users" },
  { name: "Checklists", key: "checklists" },
  { name: "Relatórios", key: "reports" },
  { name: "Financeiro", key: "financial" },
  { name: "Documentos", key: "documents" }
];

interface UserPermissionsTabProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  permissions: UserPermission[];
  onPermissionsChange: (permissions: UserPermission[]) => void;
  disabled?: boolean;
}

export function UserPermissionsTab({
  role,
  onRoleChange,
  permissions,
  onPermissionsChange,
  disabled
}: UserPermissionsTabProps) {
  const [localPermissions, setLocalPermissions] = useState<UserPermission[]>(permissions);

  useEffect(() => {
    // Initialize permissions if empty
    if (permissions.length === 0) {
      const initialPermissions = defaultModules.map(module => ({
        module: module.key,
        read: false,
        write: false,
        delete: false
      }));
      setLocalPermissions(initialPermissions);
      onPermissionsChange(initialPermissions);
    }
  }, []);

  const handlePermissionChange = (
    moduleKey: string,
    permission: "read" | "write" | "delete",
    value: boolean
  ) => {
    const updatedPermissions = localPermissions.map(p => {
      if (p.module === moduleKey) {
        // If turning off read, turn off write and delete too
        if (permission === "read" && !value) {
          return { ...p, read: false, write: false, delete: false };
        }
        // If turning on write or delete, turn on read too
        if ((permission === "write" || permission === "delete") && value) {
          return { ...p, read: true, [permission]: value };
        }
        return { ...p, [permission]: value };
      }
      return p;
    });

    setLocalPermissions(updatedPermissions);
    onPermissionsChange(updatedPermissions);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Perfil do Usuário</h3>
        <RoleSelector
          selectedRole={role}
          onRoleChange={onRoleChange}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Permissões por Módulo</h3>
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="space-y-4 p-4">
            {defaultModules.map((module) => {
              const modulePermissions = localPermissions.find(
                p => p.module === module.key
              ) || {
                module: module.key,
                read: false,
                write: false,
                delete: false
              };

              return (
                <Card key={module.key} className="p-4">
                  <h4 className="font-medium mb-4">{module.name}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${module.key}-read`}
                        checked={modulePermissions.read}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(module.key, "read", checked)
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor={`${module.key}-read`}>Visualizar</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${module.key}-write`}
                        checked={modulePermissions.write}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(module.key, "write", checked)
                        }
                        disabled={disabled || !modulePermissions.read}
                      />
                      <Label htmlFor={`${module.key}-write`}>Editar</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${module.key}-delete`}
                        checked={modulePermissions.delete}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(module.key, "delete", checked)
                        }
                        disabled={disabled || !modulePermissions.read}
                      />
                      <Label htmlFor={`${module.key}-delete`}>Excluir</Label>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
