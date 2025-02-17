
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { UserPlus, Edit, Trash2, Search, Building2, ClipboardList, Crown, Users2, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "Administrador" | "Gerente" | "Técnico";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  companies?: string[];
  checklists?: number;
}

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

const validateRole = (role: string | null): UserRole => {
  if (role === "Administrador" || role === "Gerente" || role === "Técnico") {
    return role;
  }
  return "Técnico";
};

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    role: "Técnico" as UserRole, 
    status: "active" 
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      const validatedUsers: User[] = data.map(user => ({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: validateRole(user.role),
        status: user.status || "active",
        companies: ["Empresa A", "Empresa B"],
        checklists: Math.floor(Math.random() * 10)
      }));
      setUsers(validatedUsers);
    }
  };

  const handleAddUser = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        email_confirm: true,
        user_metadata: { name: newUser.name }
      });

      if (authError) throw authError;

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
        setNewUser({ name: "", email: "", role: "Técnico", status: "active" });
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

  const handleDeleteUser = async (id: string) => {
    if (deleteConfirmText !== "CONFIRMAR") {
      toast({
        title: "Confirmação necessária",
        description: "Digite 'CONFIRMAR' para excluir o usuário",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      toast({ title: "Usuário excluído", description: "O usuário foi removido com sucesso." });
      loadUsers();
      setDeleteConfirmText("");
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
      <CardHeader className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Usuários</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os usuários da plataforma, atribua empresas e checklists
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={showInactive} 
                onCheckedChange={setShowInactive}
              />
              <span className="text-sm">Mostrar Inativos</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Novo Usuário</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="dados" className="mt-4">
                  <TabsList className="grid grid-cols-3 gap-4">
                    <TabsTrigger value="dados">Dados</TabsTrigger>
                    <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
                    <TabsTrigger value="permissoes">Permissões</TabsTrigger>
                  </TabsList>
                  <TabsContent value="dados" className="space-y-4 mt-4">
                    <Input placeholder="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                    <Input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </TabsContent>
                  <TabsContent value="atribuicoes">
                    {/* Implementar seleção de empresas e checklists */}
                  </TabsContent>
                  <TabsContent value="permissoes">
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: validateRole(e.target.value) })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="Técnico">Técnico</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </TabsContent>
                </Tabs>
                <Button onClick={handleAddUser} className="w-full mt-4">Salvar Usuário</Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full md:w-96"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Usuário</TableHead>
              <TableHead>Tipo de Perfil</TableHead>
              <TableHead>Empresas</TableHead>
              <TableHead>Checklists</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter(user => (showInactive ? user.status === "inactive" : user.status === "active"))
              .filter(user => 
                user.name?.toLowerCase().includes(search.toLowerCase()) || 
                user.email?.toLowerCase().includes(search.toLowerCase())
              )
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {roleIcons[user.role as keyof typeof roleIcons]}
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariants[user.role as keyof typeof roleBadgeVariants]}>
                      {user.role}
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
                      <span>{user.checklists || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "success" : "secondary"}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          {/* Implementar conteúdo do drawer de edição */}
                        </SheetContent>
                      </Sheet>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Digite "CONFIRMAR" para excluir o usuário.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Digite CONFIRMAR"
                          />
                          <div className="flex justify-end gap-4 mt-4">
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
