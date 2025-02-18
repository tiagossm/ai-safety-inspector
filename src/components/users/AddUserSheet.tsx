
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
import { useToast } from "@/components/ui/use-toast";

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
    checklists: []
  });
  const [companies, setCompanies] = useState<{ id: string, fantasy_name: string }[]>([]);
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false);
  const [showChecklistsDialog, setShowChecklistsDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        companies: user.companies || [],
        checklists: user.checklists || []
      });
    } else {
      // Reset form when creating new user
      setEditedUser({
        name: "",
        email: "",
        role: "Técnico",
        status: "active",
        companies: [],
        checklists: []
      });
      setSelectedCompanies([]);
      setSelectedChecklists([]);
    }
  }, [user, setSelectedCompanies, setSelectedChecklists]);

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      loadCompanyDetails();
    } else {
      setCompanies([]);
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!editedUser.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!editedUser.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

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

  const handleInputChange = (field: keyof Omit<User, "id">, value: string) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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
            <div className="space-y-1">
              <Input 
                placeholder="Nome" 
                value={editedUser.name} 
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <Input 
                placeholder="Email" 
                type="email"
                value={editedUser.email} 
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
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
              onRoleChange={(role) => handleInputChange("role", role)}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button 
            onClick={handleSave} 
            className="w-full"
            disabled={loading}
          >
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
