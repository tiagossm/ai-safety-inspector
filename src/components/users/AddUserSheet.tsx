import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";
import { Search, PlusCircle, Pencil, Trash, Lock, RefreshCcw } from "lucide-react";
import { User } from "@/types/user";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: Omit<User, "id">) => void;
}

export function AddUserSheet({ open, onOpenChange, user, onSave }: AddUserSheetProps) {
  return (
    <div className={`p-4 bg-white rounded shadow-md ${open ? "block" : "hidden"}`}>
      <h2 className="text-lg font-semibold mb-4">
        {user ? "Editar Usuário" : "Adicionar Usuário"}
      </h2>
      {/* Aqui entra o formulário de cadastro/edição – implemente os inputs e validações conforme a necessidade */}
      <Button onClick={() => onOpenChange(false)}>Fechar</Button>
    </div>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedRole, setSelectedRole] = useState<"all" | "Admin" | "Técnico" | "Usuário">("all");
  const [openAddUser, setOpenAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err: any) {
      setError("Erro ao carregar usuários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenAddUser = (user: User | null = null) => {
    setSelectedUser(user);
    setOpenAddUser(true);
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", user.id);
      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert("Falha ao atualizar o status. Por favor, tente novamente.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Erro ao excluir usuário. Tente novamente.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const lowerSearch = search.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch);
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, selectedStatus, selectedRole]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários</h1>

      {/* Filtros & Pesquisa */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input 
          placeholder="Buscar por nome ou email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          icon={<Search size={16} />}
        />
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value as any)} 
          className="border p-2 rounded"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select 
          value={selectedRole} 
          onChange={(e) => setSelectedRole(e.target.value as any)} 
          className="border p-2 rounded"
        >
          <option value="all">Todos os Perfis</option>
          <option value="Admin">Administrador</option>
          <option value="Técnico">Técnico</option>
          <option value="Usuário">Usuário</option>
        </select>
        <Button onClick={() => handleOpenAddUser()} icon={<PlusCircle size={16} />}>
          Adicionar Usuário
        </Button>
      </div>

      {/* Indicador de carregamento e mensagens */}
      {loading && <p>Carregando usuários...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Tabela de Usuários */}
      {!loading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Última Atividade</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    {roleIcons[user.role]} {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={user.status === "active"} 
                    onCheckedChange={() => handleStatusToggle(user)} 
                  />
                </TableCell>
                <TableCell>{user.lastActivity}</TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    icon={<Pencil size={14} />} 
                    onClick={() => handleOpenAddUser(user)}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    icon={<RefreshCcw size={14} />} 
                    onClick={loadUsers}
                  >
                    Atualizar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    icon={<Lock size={14} />} 
                    onClick={() => {/* Lógica para permissões */}}
                  >
                    Permissões
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    icon={<Trash size={14} />} 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal de cadastro/edição */}
      <AddUserSheet 
        open={openAddUser} 
        onOpenChange={setOpenAddUser} 
        user={selectedUser} 
        onSave={loadUsers} 
      />
    </div>
  );
}
