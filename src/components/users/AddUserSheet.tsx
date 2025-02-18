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
    permissions: [],
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
    setError("");

    if (!editedUser.name) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!validateCPF(editedUser.cpf)) {
      setError("CPF inválido.");
      return;
    }
    if (!validateEmail(editedUser.email) || (editedUser.emailSecondary && !validateEmail(editedUser.emailSecondary))) {
      setError("E-mail inválido.");
      return;
    }
    if (!validatePhone(editedUser.phone) || (editedUser.phoneSecondary && !validatePhone(editedUser.phoneSecondary))) {
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
        <div className="w-full max-w-4xl bg-background p-8 rounded-lg shadow-lg animate-fade-in relative flex flex-col md:flex-row">
          
          {/* Avatar e informações do usuário */}
          <div className="w-full md:w-1/3 flex flex-col items-center border-r md:pr-6">
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-4"></div>
            <Button variant="outline">Remover</Button>
          </div>

          {/* Formulário */}
          <div className="w-full md:w-2/3 pl-0 md:pl-6">
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
                <TabsTrigger value="permissoes">Permissões</TabsTrigger>
              </TabsList>

              <TabsContent value="permissoes">
                <h3>Definir Permissões</h3>
                <ul>
                  <li><input type="checkbox" /> Acesso ao Dashboard</li>
                  <li><input type="checkbox" /> Gerenciar Relatórios</li>
                  <li><input type="checkbox" /> Criar Novos Usuários</li>
                </ul>
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
      </div>
    </Sheet>
  );
}
