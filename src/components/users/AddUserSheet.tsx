import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserRole, UserStatus } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { roleIcons } from "./role-selector/RoleInfo";
import { Search, PlusCircle, Pencil, Trash, Loader2 } from "lucide-react";
import { AddUserSheet } from "./AddUserSheet";
import { ConfirmationModal } from "./ConfirmationModal";
import { UsersService } from "@/services/users";
import { toast } from "sonner";

export function UsersPage() {
  const {
    users,
    loading,
    params,
    setParams,
    refresh
  } = useUsers();

  const [openAddUser, setOpenAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    try {
      await UsersService.deleteUser(userId);
      toast.success("Usuário excluído com sucesso");
      refresh();
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    } finally {
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Button onClick={() => setOpenAddUser(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Buscar usuários..."
          value={params.search || ""}
          onChange={(e) => setParams(p => ({ ...p, search: e.target.value }))}
          className="flex-1 min-w-[300px]"
          leftIcon={<Search size={16} />}
        />
        
        <select
          value={params.status}
          onChange={(e) => setParams(p => ({ ...p, status: e.target.value as UserStatus }))}
          className="p-2 rounded bg-background border"
          aria-label="Filtrar por status"
        >
          <option value="all">Todos status</option>
          {Object.values(UserStatus).map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={params.role}
          onChange={(e) => setParams(p => ({ ...p, role: e.target.value as UserRole }))}
          className="p-2 rounded bg-background border"
          aria-label="Filtrar por perfil"
        >
          <option value="all">Todos perfis</option>
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={() => {
                  setSelectedUser(user);
                  setOpenAddUser(true);
                }}
                onDelete={() => setDeleteConfirmation(user.id)}
              />
            ))}
          </TableBody>
        </Table>

        {loading && (
          <div className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        )}
      </div>

      <AddUserSheet
        open={openAddUser}
        user={selectedUser}
        onClose={() => {
          setOpenAddUser(false);
          setSelectedUser(null);
        }}
        onSaved={refresh}
      />

      <ConfirmationModal
        open={!!deleteConfirmation}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir este usuário permanentemente?"
        onConfirm={() => deleteConfirmation && handleDelete(deleteConfirmation)}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </div>
  );
}

const UserRow = ({ user, onEdit, onDelete }: { 
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusToggle = async () => {
    try {
      setUpdating(true);
      const newStatus = user.status === UserStatus.ACTIVE 
        ? UserStatus.INACTIVE 
        : UserStatus.ACTIVE;
      
      await UsersService.updateUser(user.id, { status: newStatus });
      toast.success("Status atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{user.email}</span>
          {user.phone && <span className="text-muted-foreground">{user.phone}</span>}
        </div>
      </TableCell>
      <TableCell>{user.company || "-"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {roleIcons[user.role]}
          <span>{user.role}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={user.status === UserStatus.ACTIVE}
            onCheckedChange={handleStatusToggle}
            disabled={updating}
            aria-label="Alternar status do usuário"
          />
          <span className="capitalize">{user.status}</span>
          {updating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            aria-label="Editar usuário"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            aria-label="Excluir usuário"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};