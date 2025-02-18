import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // 🔹 Adicionamos o toggle switch
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole } from "@/types/user";
import { AssignCompaniesDialog } from "./AssignCompaniesDialog";
import { AssignChecklistsDialog } from "./AssignChecklistsDialog";
import { RoleSelector } from "./role-selector/RoleSelector";
import { AssignmentSection } from "./assignments/AssignmentSection";
import { supabase } from "@/integrations/supabase/client";

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
    email: user?.email || "",
    role: user?.role || "Técnico",
    status: user?.status || "active", // 🔹 Definindo status do usuário
    companies: user?.companies || [],
    checklists: user?.checklists || []
  });

  const [loading, setLoading] = useState(false);
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false);
  const [showChecklistsDialog, setShowChecklistsDialog] = useState(false);
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
        email: user.email,
        role: user.role,
        status: user.status, // 🔹 Certificando que o status do usuário é carregado
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-lg mx-auto p-6 bg-background rounded-lg shadow-lg">

        <SheetHeader>
          <SheetTitle>{user ? "Editar Usuário" : "Novo Usuário"}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>

          {/* Seção: Dados do usuário */}
          <TabsContent value="dados" className="space-y-4 mt-4">
            <Input
              label="Nome"
              placeholder="Digite o nome do usuário"
              value={editedUser.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
            />
            <Input
              label="Email"
              placeholder="Digite o email"
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            />

            {/* 🔹 Toggle de ativação/desativação */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium">
                {editedUser.status === "active" ? "Usuário Ativo" : "Usuário Inativo"}
              </span>
              <Switch
                checked={editedUser.status === "active"}
                onCheckedChange={(checked) =>
                  setEditedUser({ ...editedUser, status: checked ? "active" : "inactive" })
                }
              />
            </div>
          </TabsContent>

          {/* Seção: Atribuições */}
          <TabsContent value="atribuicoes" className="space-y-6 mt-4">
            <AssignmentSection
              title="Empresas atribuídas"
              count={selectedCompanies.length}
              onAdd={() => setShowCompaniesDialog(true)}
            >
              <div className="space-y-2">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span>{company.fantasy_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCompanies(selectedCompanies.filter(id => id !== company.id))}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </AssignmentSection>

            <AssignmentSection
              title="Checklists atribuídos"
              count={selectedChecklists.length}
              onAdd={() => setShowChecklistsDialog(true)}
              disabled={selectedCompanies.length === 0}
              disabledMessage="Primeiro, atribua empresas ao usuário para poder selecionar os checklists."
            >
              {selectedCompanies.length > 0 && (
                <div className="bg-background p-4 rounded-md">
                  {/* Aqui ficará a listagem dos checklists */}
                </div>
              )}
            </AssignmentSection>
          </TabsContent>

          {/* Seção: Permissões */}
          <TabsContent value="permissoes" className="space-y-4 mt-4">
            <RoleSelector
              selectedRole={editedUser.role}
              onRoleChange={(role) => setEditedUser({ ...editedUser, role })}
            />
          </TabsContent>
        </Tabs>

        {/* Botão de salvar com loading */}
        <div className="mt-6">
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? "Salvando..." : user ? "Salvar Alterações" : "Criar Usuário"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
