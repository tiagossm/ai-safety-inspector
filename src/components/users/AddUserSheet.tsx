import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: Omit<User, "id">) => Promise<void>;
  selectedCompanies: string[];
  setSelectedCompanies: (companies: string[]) => void;
  selectedChecklists: string[];
  setSelectedChecklists: (checklists: string[]) => void;
}

export function AddUserSheet({
  open,
  onOpenChange,
  user,
  onSave,
  selectedCompanies,
  setSelectedCompanies,
  selectedChecklists,
  setSelectedChecklists
}: AddUserSheetProps) {
  const [editedUser, setEditedUser] = useState<Omit<User, "id">>({
    name: user?.name || "",
    cpf: user?.cpf || "",
    email1: user?.email1 || "",
    email2: user?.email2 || "",
    phone1: user?.phone1 || "",
    phone2: user?.phone2 || "",
    role: user?.role || ["Técnico"],
    status: user?.status || "active",
    companies: user?.companies || [],
    checklists: user?.checklists || []
  });

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: string, fantasy_name: string }[]>([]);

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      loadCompanyDetails();
    }
  }, [selectedCompanies]);

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        cpf: user.cpf,
        email1: user.email1,
        email2: user.email2,
        phone1: user.phone1,
        phone2: user.phone2,
        role: user.role,
        status: user.status,
        companies: user.companies,
        checklists: user.checklists
      });
    }
  }, [user]);

  const loadCompanyDetails = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, fantasy_name")
      .in("id", selectedCompanies);

    if (data) {
      setCompanies(data);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(editedUser);
    setLoading(false);
  };

  const handleRoleChange = (role: UserRole) => {
    setEditedUser((prev) => ({
      ...prev,
      role: prev.role.includes(role)
        ? prev.role.filter((r) => r !== role)
        : [...prev.role, role]
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl bg-background p-6 rounded-lg shadow-lg animate-fade-in">
            <SheetHeader>
              <SheetTitle className="text-center text-xl font-bold">
                {user ? "Editar Usuário" : "Novo Usuário"}
              </SheetTitle>
            </SheetHeader>

            <Tabs defaultValue="dados" className="mt-4">
              <TabsList className="flex justify-center gap-4">
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
                <TabsTrigger value="permissoes">Permissões</TabsTrigger>
              </TabsList>

              {/* Seção de Dados */}
              <TabsContent value="dados" className="space-y-4 mt-4">
                <Input placeholder="Nome Completo" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} />
                <Input placeholder="CPF" value={editedUser.cpf} onChange={(e) => setEditedUser({ ...editedUser, cpf: e.target.value })} />
                <Input placeholder="E-mail Principal" type="email" value={editedUser.email1} onChange={(e) => setEditedUser({ ...editedUser, email1: e.target.value })} />
                <Input placeholder="E-mail Secundário (Opcional)" type="email" value={editedUser.email2} onChange={(e) => setEditedUser({ ...editedUser, email2: e.target.value })} />
                <Input placeholder="Telefone Principal" type="tel" value={editedUser.phone1} onChange={(e) => setEditedUser({ ...editedUser, phone1: e.target.value })} />
                <Input placeholder="Telefone Secundário (Opcional)" type="tel" value={editedUser.phone2} onChange={(e) => setEditedUser({ ...editedUser, phone2: e.target.value })} />

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">{editedUser.status === "active" ? "Usuário Ativo" : "Usuário Inativo"}</span>
                  <Switch checked={editedUser.status === "active"} onCheckedChange={(checked) => setEditedUser({ ...editedUser, status: checked ? "active" : "inactive" })} />
                </div>
              </TabsContent>

              {/* Seção de Permissões */}
              <TabsContent value="permissoes" className="space-y-4 mt-4">
                <h3 className="text-md font-semibold">Tipo de Perfil</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["Administrador", "Técnico", "Usuário"].map((role) => (
                    <label key={role} className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-pointer">
                      <input type="checkbox" checked={editedUser.role.includes(role as UserRole)} onChange={() => handleRoleChange(role as UserRole)} />
                      <span className="text-lg">{roleIcons[role as UserRole]}</span>
                      {role}
                    </label>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Botão de salvar */}
            <div className="mt-6 flex justify-center">
              <Button onClick={handleSave} className="w-3/4" disabled={!editedUser.name || !editedUser.email1 || loading}>
                {loading ? "Salvando..." : user ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
