import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";
import { X, Loader2, UserCircle } from "lucide-react";
import { validateCPF, validateEmail, validatePhone } from "@/utils/validators";
import { Checkbox } from "@/components/ui/checkbox";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: Omit<User, "id">) => Promise<void>;
}

const PERMISSIONS_LIST = ["create_user", "edit_user", "delete_user", "manage_companies"];
const permissionLabels = {
  create_user: "Criar Usuários",
  edit_user: "Editar Usuários",
  delete_user: "Excluir Usuários",
  manage_companies: "Gerenciar Empresas"
};

export function AddUserSheet({ open, onOpenChange, user, onSave }: AddUserSheetProps) {
  const [editedUser, setEditedUser] = useState<Omit<User, "id">>({
    name: "",
    cpf: "",
    email: "",
    emailSecondary: "",
    phone: "",
    phoneSecondary: "",
    roles: [],
    permissions: [],
    status: "active",
    companies: [],
    checklists: []
  });

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; fantasy_name: string }[]>([]);
  const [checklists, setChecklists] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (open) {
      loadCompanies();
      loadChecklists();
      if (user) {
        setEditedUser({
          name: user.name,
          cpf: user.cpf || "",
          email: user.email,
          emailSecondary: user.emailSecondary || "",
          phone: user.phone || "",
          phoneSecondary: user.phoneSecondary || "",
          roles: user.roles || [],
          permissions: user.permissions || [],
          status: user.status,
          companies: user.companies || [],
          checklists: user.checklists || []
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
    if (!editedUser.name) return alert("Nome é obrigatório.");
    if (!validateCPF(editedUser.cpf)) return alert("CPF inválido.");
    if (!validateEmail(editedUser.email)) return alert("E-mail inválido.");
    if (!validatePhone(editedUser.phone)) return alert("Telefone inválido.");

    setLoading(true);
    await onSave(editedUser);
    setLoading(false);

    if (!addAnother) {
      onOpenChange(false);
    } else {
      setEditedUser({
        name: "",
        cpf: "",
        email: "",
        emailSecondary: "",
        phone: "",
        phoneSecondary: "",
        roles: [],
        permissions: [],
        status: "active",
        companies: [],
        checklists: []
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-3xl bg-background p-6 rounded-lg shadow-lg relative">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200" onClick={() => onOpenChange(false)}>
            <X size={24} />
          </button>

          <SheetHeader>
            <SheetTitle className="text-center text-xl font-bold">
              {user ? "Editar Usuário" : "Novo Usuário"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col items-center mb-4">
            <UserCircle size={80} className="text-gray-400" />
          </div>

          <Tabs defaultValue="dados" className="mt-4">
            <TabsList className="flex justify-center gap-4">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
              <TabsTrigger value="tipoPerfil">Tipo de Perfil</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              <Input placeholder="Nome Completo" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} />
              <Input placeholder="CPF" value={editedUser.cpf} onChange={(e) => setEditedUser({ ...editedUser, cpf: e.target.value })} />
            </TabsContent>

            <TabsContent value="permissoes" className="space-y-4 mt-4">
              <h3 className="text-md font-semibold">Definir Permissões</h3>
              {PERMISSIONS_LIST.map(permission => (
                <label key={permission} className="flex items-center gap-2">
                  <Checkbox checked={editedUser.permissions.includes(permission)}
                    onCheckedChange={(checked) => {
                      const newPermissions = checked
                        ? [...editedUser.permissions, permission]
                        : editedUser.permissions.filter(p => p !== permission);
                      setEditedUser({ ...editedUser, permissions: newPermissions });
                    }} />
                  {permissionLabels[permission]}
                </label>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={() => handleSave(false)} className="w-1/2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : user ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
            <Button onClick={() => handleSave(true)} className="w-1/2 bg-secondary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Criar e Adicionar Outro"}
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
