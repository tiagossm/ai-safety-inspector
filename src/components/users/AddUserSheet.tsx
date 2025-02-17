import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Crown, Users2, Wrench } from "lucide-react";
import { User, UserRole } from "@/types/user";
import { AssignCompaniesDialog } from "./AssignCompaniesDialog";
import { AssignChecklistsDialog } from "./AssignChecklistsDialog";
import { supabase } from "@/integrations/supabase/client";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newUser: Omit<User, 'id'>;
  onNewUserChange: (user: Omit<User, 'id'>) => void;
  onSave: () => void;
}

const roleInfo = {
  Administrador: {
    icon: <Crown className="h-5 w-5 text-green-500" />,
    description: "Acesso total ao sistema, gerencia usuários e suas permissões",
    permissions: [
      "Acessa tudo no sistema",
      "Gerencia usuários e permissões",
      "Gerencia empresas e checklists",
      "Visualiza todos os relatórios"
    ]
  },
  Gerente: {
    icon: <Users2 className="h-5 w-5 text-yellow-500" />,
    description: "Gerencia empresas e checklists, atribui tarefas aos técnicos",
    permissions: [
      "Gerencia empresas e checklists",
      "Atribui checklists para usuários",
      "Visualiza relatórios da empresa",
      "Não pode alterar usuários/permissões"
    ]
  },
  Técnico: {
    icon: <Wrench className="h-5 w-5 text-blue-500" />,
    description: "Preenche checklists e faz upload de evidências",
    permissions: [
      "Preenche checklists atribuídos",
      "Faz upload de arquivos/evidências",
      "Gera relatórios dos seus checklists",
      "Visualiza checklists da empresa"
    ]
  }
};

export function AddUserSheet({
  open,
  onOpenChange,
  newUser,
  onNewUserChange,
  onSave
}: AddUserSheetProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false);
  const [showChecklistsDialog, setShowChecklistsDialog] = useState(false);
  const [companies, setCompanies] = useState<{ id: string, fantasy_name: string }[]>([]);

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      loadCompanyDetails();
    }
  }, [selectedCompanies]);

  const loadCompanyDetails = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, fantasy_name")
      .in("id", selectedCompanies);

    if (data) {
      setCompanies(data);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl">
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
            <Input 
              placeholder="Nome" 
              value={newUser.name} 
              onChange={(e) => onNewUserChange({ ...newUser, name: e.target.value })} 
            />
            <Input 
              placeholder="Email" 
              type="email" 
              value={newUser.email} 
              onChange={(e) => onNewUserChange({ ...newUser, email: e.target.value })} 
            />
          </TabsContent>
          
          <TabsContent value="atribuicoes" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Empresas atribuídas ({selectedCompanies.length})
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCompaniesDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Empresa
                </Button>
              </div>
              
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
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Checklists atribuídos ({selectedChecklists.length})
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowChecklistsDialog(true)}
                  disabled={selectedCompanies.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Checklist
                </Button>
              </div>
              
              {selectedCompanies.length === 0 && (
                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                  Primeiro, atribua empresas ao usuário para poder selecionar os checklists.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="permissoes" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {(Object.entries(roleInfo) as [UserRole, typeof roleInfo[UserRole]][]).map(([role, info]) => (
                <div
                  key={role}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    newUser.role === role 
                      ? 'border-primary bg-accent' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  onClick={() => onNewUserChange({ ...newUser, role: role })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {info.icon}
                    <h3 className="font-medium">{role}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {info.description}
                  </p>
                  <div className="space-y-2">
                    {info.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant={newUser.role === role ? "default" : "secondary"} className="h-1.5 w-1.5 rounded-full p-0" />
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button onClick={onSave} className="w-full">
            Criar Usuário
          </Button>
        </div>

        <AssignCompaniesDialog
          open={showCompaniesDialog}
          onOpenChange={setShowCompaniesDialog}
          userId=""
          selectedCompanies={selectedCompanies}
          onCompaniesChange={setSelectedCompanies}
        />

        <AssignChecklistsDialog
          open={showChecklistsDialog}
          onOpenChange={setShowChecklistsDialog}
          userId=""
          selectedCompanies={selectedCompanies}
          selectedChecklists={selectedChecklists}
          onChecklistsChange={setSelectedChecklists}
        />
      </SheetContent>
    </Sheet>
  );
}
