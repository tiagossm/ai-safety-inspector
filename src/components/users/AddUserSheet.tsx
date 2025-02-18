
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";
import { X } from "lucide-react";
import { validateCPF, validateEmail, validatePhone } from "@/utils/validators";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: Omit<User, "id">) => Promise<void>;
}

export function AddUserSheet({ open, onOpenChange, user, onSave }: AddUserSheetProps) {
  const [editedUser, setEditedUser] = useState<Omit<User, "id">>({
    name: "",
    cpf: "",
    email: "",
    emailSecondary: "",
    phone: "",
    phoneSecondary: "",
    roles: [],
    status: "active",
    companies: [],
    checklists: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

    // Validação dos campos
    if (!editedUser.name) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!validateCPF(editedUser.cpf || "")) {
      setError("CPF inválido.");
      return;
    }
    if (!validateEmail(editedUser.email) || (editedUser.emailSecondary && !validateEmail(editedUser.emailSecondary))) {
      setError("E-mail inválido.");
      return;
    }
    if (!validatePhone(editedUser.phone || "") || (editedUser.phoneSecondary && !validatePhone(editedUser.phoneSecondary))) {
      setError("Número de telefone inválido.");
      return;
    }

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
        status: "active",
        companies: [],
        checklists: []
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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

          {error && <p className="text-red-500 text-center">{error}</p>}

          <Tabs defaultValue="dados" className="mt-4">
            <TabsList className="flex justify-center gap-4">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
              <TabsTrigger value="tipoPerfil">Tipo de Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              <Input placeholder="Nome Completo" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} />
              <Input placeholder="CPF" value={editedUser.cpf} onChange={(e) => setEditedUser({ ...editedUser, cpf: e.target.value })} />
              <Input placeholder="E-mail Principal" type="email" value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} />
              <Input placeholder="E-mail Secundário (Opcional)" type="email" value={editedUser.emailSecondary} onChange={(e) => setEditedUser({ ...editedUser, emailSecondary: e.target.value })} />
              <Input placeholder="Telefone Principal" value={editedUser.phone} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} />
              <Input placeholder="Telefone Secundário (Opcional)" value={editedUser.phoneSecondary} onChange={(e) => setEditedUser({ ...editedUser, phoneSecondary: e.target.value })} />
            </TabsContent>

            <TabsContent value="atribuicoes" className="space-y-4 mt-4">
              <h3 className="text-md font-semibold">Empresas</h3>
              <div className="space-y-2">
                {companies.map((company) => (
                  <label key={company.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <input
                      type="checkbox"
                      checked={editedUser.companies?.includes(company.id)}
                      onChange={(e) => {
                        const newCompanies = e.target.checked
                          ? [...(editedUser.companies || []), company.id]
                          : editedUser.companies?.filter(id => id !== company.id) || [];
                        setEditedUser({ ...editedUser, companies: newCompanies });
                      }}
                    />
                    {company.fantasy_name}
                  </label>
                ))}
              </div>

              <h3 className="text-md font-semibold mt-6">Checklists</h3>
              <div className="space-y-2">
                {checklists.map((checklist) => (
                  <label key={checklist.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <input
                      type="checkbox"
                      checked={editedUser.checklists?.includes(checklist.id)}
                      onChange={(e) => {
                        const newChecklists = e.target.checked
                          ? [...(editedUser.checklists || []), checklist.id]
                          : editedUser.checklists?.filter(id => id !== checklist.id) || [];
                        setEditedUser({ ...editedUser, checklists: newChecklists });
                      }}
                    />
                    {checklist.title}
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tipoPerfil" className="space-y-4 mt-4">
              <h3 className="text-md font-semibold">Tipo de Perfil</h3>
              <div className="space-y-2">
                {["Administrador", "Gerente", "Técnico"].map((role) => (
                  <label key={role} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <input
                      type="checkbox"
                      checked={editedUser.roles.includes(role)}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...editedUser.roles, role]
                          : editedUser.roles.filter(r => r !== role);
                        setEditedUser({ ...editedUser, roles: newRoles });
                      }}
                    />
                    <span className="flex items-center gap-2">
                      {roleIcons[role as keyof typeof roleIcons]}
                      {role}
                    </span>
                  </label>
                ))}
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
    </Sheet>
  );
}
