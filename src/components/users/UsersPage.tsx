
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";
import { Search, Filter, PlusCircle, Pencil, Trash, Lock, RefreshCcw } from "lucide-react";
import { AddUserSheet } from "./AddUserSheet";
import { User } from "@/types/user";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedRole, setSelectedRole] = useState<"all" | "Admin" | "Técnico" | "Usuário">("all");
  const [openAddUser, setOpenAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from("users").select("*");
    if (data) {
      const formattedUsers: User[] = data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        emailSecondary: user.email_secondary,
        phone: user.phone,
        phoneSecondary: user.phone_secondary,
        roles: user.roles || [],
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      setUsers(formattedUsers);
    }
  };

  const handleOpenAddUser = (user: User | null = null) => {
    setSelectedUser(user);
    setOpenAddUser(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    const matchesRole = selectedRole === "all" || user.roles.includes(selectedRole);
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>

      {/* Filtros & Pesquisa */}
      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Buscar por nome ou email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as any)} className="border p-2 rounded">
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as any)} className="border p-2 rounded">
          <option value="all">Todos os Perfis</option>
          <option value="Admin">Administrador</option>
          <option value="Técnico">Técnico</option>
          <option value="Usuário">Usuário</option>
        </select>
        <Button onClick={() => handleOpenAddUser()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Tabela de Usuários */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>Perfil</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Última Atualização</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  {user.roles[0]} {/* Display first role */}
                </span>
              </TableCell>
              <TableCell>
                <Switch checked={user.status === "active"} />
              </TableCell>
              <TableCell>{user.updated_at}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenAddUser(user)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="ghost">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Resetar Senha
                </Button>
                <Button size="sm" variant="ghost">
                  <Lock className="h-4 w-4 mr-2" />
                  Permissões
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddUserSheet 
        open={openAddUser} 
        onOpenChange={setOpenAddUser} 
        user={selectedUser} 
        onSave={loadUsers} 
      />
    </div>
  );
}
