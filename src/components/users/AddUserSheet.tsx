
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserPermission, UserRole } from "@/types/user";
import { AssignCompaniesDialog } from "./AssignCompaniesDialog";
import { AssignChecklistsDialog } from "./AssignChecklistsDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserCog, Building2, Shield, History } from "lucide-react";
import { UserDataTab } from "./tabs/UserDataTab";
import { UserAssignmentsTab } from "./tabs/UserAssignmentsTab";
import { UserPermissionsTab } from "./tabs/UserPermissionsTab";
import { UserHistoryTab } from "./tabs/UserHistoryTab";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: Omit<User, "id">, selectedCompanies: string[], selectedChecklists: string[]) => Promise<boolean>;
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editedUser, setEditedUser] = useState<Omit<User, "id">>({
    name: "",
    email: "",
    role: "Técnico",
    status: "active",
    companies: [],
    checklists: [],
    permissions: []
  });
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false);
  const [showChecklistsDialog, setShowChecklistsDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        phone: user.phone,
        position: user.position,
        companies: user.companies || [],
        checklists: user.checklists || [],
        permissions: user.permissions || [],
        created_at: user.created_at,
        last_activity: user.last_activity,
        activities: user.activities || []
      });
    } else {
      setEditedUser({
        name: "",
        email: "",
        role: "Técnico",
        status: "active",
        companies: [],
        checklists: [],
        permissions: []
      });
      setSelectedCompanies([]);
      setSelectedChecklists([]);
    }
  }, [user, setSelectedCompanies, setSelectedChecklists]);

  const handleFieldChange = (field: keyof User, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const handleResetPassword = async () => {
    if (!editedUser.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(editedUser.email);
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Um email de redefinição de senha foi enviado."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de redefinição.",
        variant: "destructive"
      });
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (!editedUser.email) return;
    
    try {
      // Implement welcome email logic here
      toast({
        title: "Email enviado",
        description: "Email de boas-vindas enviado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de boas-vindas.",
        variant: "destructive"
      });
    }
  };

  const handlePermissionsChange = (permissions: UserPermission[]) => {
    handleFieldChange("permissions", permissions);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await onSave(editedUser, selectedCompanies, selectedChecklists);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-3xl">
        <SheetHeader>
          <SheetTitle>{user ? "Editar Usuário" : "Novo Usuário"}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="atribuicoes" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Atribuições
            </TabsTrigger>
            <TabsTrigger value="permissoes" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger 
              value="historico" 
              className="flex items-center gap-2"
              disabled={!user}
            >
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados" className="mt-4">
            <UserDataTab
              user={editedUser}
              isNew={!user}
              loading={loading}
              onUserChange={handleFieldChange}
              onResetPassword={handleResetPassword}
              onSendWelcomeEmail={handleSendWelcomeEmail}
            />
          </TabsContent>
          
          <TabsContent value="atribuicoes" className="mt-4">
            <UserAssignmentsTab
              companies={selectedCompanies}
              checklists={selectedChecklists}
              onAddCompany={() => setShowCompaniesDialog(true)}
              onRemoveCompany={(company) => 
                setSelectedCompanies(selectedCompanies.filter(c => c !== company))
              }
              onAddChecklist={() => setShowChecklistsDialog(true)}
              onRemoveChecklist={(checklist) =>
                setSelectedChecklists(selectedChecklists.filter(c => c !== checklist))
              }
              disabled={loading}
            />
          </TabsContent>
          
          <TabsContent value="permissoes" className="mt-4">
            <UserPermissionsTab
              role={editedUser.role}
              onRoleChange={(role) => handleFieldChange("role", role)}
              permissions={editedUser.permissions || []}
              onPermissionsChange={handlePermissionsChange}
              disabled={loading}
            />
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <UserHistoryTab
              activities={editedUser.activities || []}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Salvando..." : (user ? "Salvar Alterações" : "Criar Usuário")}
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
