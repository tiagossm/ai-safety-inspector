
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, MoreVertical, Edit, Trash2, Search, ShieldCheck, ShieldX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Usuário", status: "active" });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) setUsers(data);
  };

  const handleAddUser = async () => {
    try {
      // 1. Criar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        email_confirm: true,
        user_metadata: { name: newUser.name }
      });

      if (authError) throw authError;

      // 2. O trigger irá criar o usuário na tabela users automaticamente
      // 3. Atualizar as informações adicionais
      if (authData.user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            role: newUser.role,
            status: newUser.status 
          })
          .eq("id", authData.user.id);

        if (updateError) throw updateError;

        toast({ title: "Usuário adicionado", description: "O usuário foi cadastrado com sucesso." });
        setIsAddingUser(false);
        setNewUser({ name: "", email: "", role: "Usuário", status: "active" });
        loadUsers();
      }
    } catch (error: any) {
      toast({ 
        title: "Erro ao adicionar usuário", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleToggleStatus = async (id: string, status: string) => {
    const newStatus = status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status atualizado", description: `Usuário agora está ${newStatus === "active" ? "Ativo" : "Inativo"}` });
      loadUsers();
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      // 1. Primeiro deletamos o usuário do Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // 2. O trigger ON DELETE CASCADE irá remover o usuário da tabela users
      toast({ title: "Usuário excluído", description: "O usuário foi removido." });
      loadUsers();
    } catch (error: any) {
      toast({ 
        title: "Erro ao excluir", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Usuários</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? <ShieldX className="h-4 w-4 mr-2 text-red-500" /> : <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />}
            {showInactive ? "Mostrar Ativos" : "Mostrar Inativos"}
          </Button>
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button variant="default">
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                <Input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="Usuário">Usuário</option>
                  <option value="Administrador">Administrador</option>
                </select>
                <Button onClick={handleAddUser} className="w-full">Salvar Usuário</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter(user => (showInactive ? user.status === "inactive" : user.status === "active"))
              .filter(user => user.name?.toLowerCase().includes(search.toLowerCase()) || user.email?.toLowerCase().includes(search.toLowerCase()))
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <input type="checkbox" checked={user.status === "inactive"} onChange={() => handleToggleStatus(user.id, user.status)} />
                    {user.status === "active" ? " Ativo" : " Inativo"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
