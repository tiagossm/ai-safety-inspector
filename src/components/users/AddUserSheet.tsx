import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    status: user?.status || "active",
    companies: user?.companies || [],
    checklists: user?.checklists || []
  });

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
    await onSave(editedUser);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl">
        <SheetHeader>
          <SheetTitle>{user ? "Editar Usuário" : "Novo Usuário"}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados" className="space-y-4 mt-4">
            <Input 
              placeholder="Nome" 
              value={editedUser.name} 
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} 
            />
            <Input 
              placeholder="Email" 
              type="email"
              value={editedUser.email} 
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} 
            />
          </TabsContent>
          
          <TabsContent value="atribuicoes" className="space-y-6 mt-4">
            <AssignmentSection
              title="Empresas atribuídas"
              count={selectedCompanies.length}
              onAdd={() => setShowCompaniesDialog(true)}
            >
              <div className="space-y-2">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-2 bg-accent rounded-md">
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
              {selectedCompanies.length > 0 && <div>
                {/* Checklist items will be rendered here */}
              </div>}
            </AssignmentSection>
          </TabsContent>
          
          <TabsContent value="permissoes" className="space-y-4 mt-4">
            <RoleSelector
              selectedRole={editedUser.role}
              onRoleChange={(role) => setEditedUser({ ...editedUser, role })}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button onClick={handleSave} className="w-full">
            {user ? "Salvar Alterações" : "Criar Usuário"}
          </Button>
        </div>

        <AssignCompaniesDialog
          open={showCompaniesDialog}
          onOpenChange={setShowCompaniesDialog}
          userId={user?.id || ""}
          selectedCompanies={selectedCompanies}
          onCompaniesChange={setSelectedCompanies}
        />

        <AssignChecklistsDialog
          open={showChecklistsDialog}
          onOpenChange={setShowChecklistsDialog}
          userId={user?.id || ""}
          selectedCompanies={selectedCompanies}
          selectedChecklists={selectedChecklists}
          onChecklistsChange={setSelectedChecklists}
        />
      </SheetContent>
    </Sheet>
  );
}
