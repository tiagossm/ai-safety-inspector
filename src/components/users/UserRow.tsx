
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Building2, ClipboardList, Crown, Edit, Trash2, Users2, Wrench } from "lucide-react";
import { User } from "@/types/user";

const roleIcons = {
  Administrador: <Crown className="h-4 w-4 text-green-500" />,
  Gerente: <Users2 className="h-4 w-4 text-yellow-500" />,
  Técnico: <Wrench className="h-4 w-4 text-blue-500" />
};

const roleBadgeVariants = {
  Administrador: "success",
  Gerente: "warning",
  Técnico: "default"
} as const;

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  // Get the first role from the roles array, defaulting to "Técnico"
  const primaryRole = user.roles[0] || "Técnico";

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-start gap-2">
          {roleIcons[primaryRole as keyof typeof roleIcons]}
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={roleBadgeVariants[primaryRole as keyof typeof roleBadgeVariants]}>
          {primaryRole}
        </Badge>
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{user.companies?.length || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="list-disc list-inside">
                {user.companies?.map((company, index) => (
                  <li key={index}>{company}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <ClipboardList className="h-4 w-4" />
          <span>{user.checklists?.length || 0}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={user.status === "active" ? "success" : "secondary"}>
          {user.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
