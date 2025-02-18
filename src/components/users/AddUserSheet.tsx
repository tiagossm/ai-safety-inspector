import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";
import { X } from "lucide-react";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: Omit<User, "id">) => Promise<void>;
}

export function AddUserSheet({ open, onOpenChange, user, onSave }: AddUserSheetProps) {
  const [editedUser, setEditedUser] = useState<Omit<User, "id">>({
    name: "",
    email: "",
    role: "Técnico",
    status: "active",
    companies: [],
    checklists: [],
    permissions: []
  });

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; fantasy_name: string }[]>([]);
  const [checklists, setChecklists] = useState<{ id: string; title: string }[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadCompanies();
      loadChecklists();
      if (user) {
        setEditedUser({
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          companies: user.companies || [],
          checklists: user.checklists || [],
          permissions: user.permissions || []
        });
      }
    }
  }, [open, user]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const loadCompanies = async () => {
    const { data } = await supabase.from("companies").select("id, fantasy_name");
    if (data) setCompanies(data);
  };

  const loadChecklists = async () => {
    const { data } = await supabase.from("checklists").select("id, title");
    if (data) setChecklists(data);
  };

  const handleSave = async (addAnother = false) => {
    setLoading(true);
    await onSave(editedUser);
    setLoading(false);
    if (!addAnother) {
      onOpenChange(false);
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
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl bg-background p-6 rounded-lg shadow-lg animate-fade-in relative">
            
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200" onClick={() => onOpenChange(false)}>
              <X size={24} />
            </button>

            <SheetHeader>
              <SheetTitle className="text-center text-xl font-bold">
                {user ? "Editar Usuário" : "Novo Usuário"}
              </SheetTitle>
            </SheetHeader>

            <Tabs defaultValue="dados" className="mt-4">
              <TabsList className="flex justify-center gap-4">
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
                <TabsTrigger value="tipoPerfil">Tipo de Perfil</TabsTrigger>
                <TabsTrigger value="permissoes">Permissões</TabsTrigger>
              </TabsList>

              <TabsContent value="dados" className="space-y-4 mt-4">
                <Input placeholder="Nome Completo" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} />
                <Input placeholder="E-mail" type="email" value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">{editedUser.status === "active" ? "Usuário Ativo" : "Usuário Inativo"}</span>
                  <Switch checked={editedUser.status === "active"} onCheckedChange={(checked) => setEditedUser({ ...editedUser, status: checked ? "active" : "inactive" })} />
                </div>
              </TabsContent>

              <TabsContent value="tipoPerfil" className="space-y-4 mt-4">
                <h3 className="text-md font-semibold">Tipo de Perfil</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{roleIcons[editedUser.role]}</span>
                  <select className="p-2 border rounded-md" value={editedUser.role} onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as UserRole })}>
                    <option value="Administrador">Administrador</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Usuário">Usuário</option>
                  </select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={() => handleSave(false)} className="w-1/2" disabled={loading}>
                {loading ? "Salvando..." : user ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
              <Button onClick={() => handleSave(true)} className="w-1/2 bg-secondary" disabled={loading}>
                {loading ? "Salvando..." : "Criar e Adicionar Outro"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}
