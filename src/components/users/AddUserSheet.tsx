import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole } from "@/types/user";
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
    setLoading(true);
    await onSave(editedUser);
    setLoading(false);
  };

  const roleIcons = {
    "Administrador": "👑",
    "Técnico": "🦺",
    "Usuário": "👤"
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-lg mx-auto p-6 bg-background rounded-lg shadow-lg animate-fade-in">
        <SheetHeader>
          <SheetTitle className="text-center">
            {user ? "Editar Usuário" : "Novo Usuário"}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="flex justify-center gap-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>

          {/* Seção: Dados do usuário */}
          <TabsContent value="dados" className="space-y-4 mt-4">
            <Input
              placeholder="Digite o nome do usuário"
              value={editedUser.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
            />
            <Input
              placeholder="Digite o email"
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            />

            {/* Toggle de ativação/desativação */}
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
            <h3 className="text-md font-semibold">Empresas atribuídas</h3>
            <div className="space-y-2">
              {companies.map((company) => (
                <label key={company.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCompanies([...selectedCompanies, company.id]);
                      } else {
                        setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                      }
                    }}
                  />
                  {company.fantasy_name}
                </label>
              ))}
            </div>

            <h3 className="text-md font-semibold">Checklists atribuídos</h3>
            {selectedCompanies.length === 0 ? (
              <p className="text-sm text-muted">Primeiro, atribua empresas ao usuário.</p>
            ) : (
              <div className="space-y-2">
                {selectedChecklists.map((checklistId) => (
                  <label key={checklistId} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedChecklists.includes(checklistId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChecklists([...selectedChecklists, checklistId]);
                        } else {
                          setSelectedChecklists(selectedChecklists.filter(id => id !== checklistId));
                        }
                      }}
                    />
                    Checklist {checklistId}
                  </label>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Seção: Permissões */}
          <TabsContent value="permissoes" className="space-y-4 mt-4">
            <h3 className="text-md font-semibold">Tipo de Perfil</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg">{roleIcons[editedUser.role]}</span>
              <select
                className="p-2 border rounded-md"
                value={editedUser.role}
                onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as UserRole })}
              >
                <option value="Administrador">Administrador</option>
                <option value="Técnico">Técnico</option>
                <option value="Usuário">Usuário</option>
              </select>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botão de salvar com loading */}
        <div className="mt-6">
          <Button onClick={handleSave} className="w-full" disabled={!editedUser.name || !editedUser.email || loading}>
            {loading ? "Salvando..." : user ? "Salvar Alterações" : "Criar Usuário"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
