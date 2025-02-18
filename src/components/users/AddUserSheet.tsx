import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { roleIcons } from "./role-selector/RoleInfo";
import { X, Loader2 } from "lucide-react";
import { validateCPF, validateEmail, validatePhone } from "@/utils/validators";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: ''
  });
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
    setFieldErrors({
      name: '',
      cpf: '',
      email: '',
      phone: ''
    });

    let hasErrors = false;
    const newErrors = {
      name: '',
      cpf: '',
      email: '',
      phone: ''
    };

    if (!editedUser.name) {
      newErrors.name = 'Nome é obrigatório';
      hasErrors = true;
    }

    if (editedUser.cpf && !validateCPF(editedUser.cpf)) {
      newErrors.cpf = 'CPF inválido';
      hasErrors = true;
    }

    if (!validateEmail(editedUser.email)) {
      newErrors.email = 'Email inválido';
      hasErrors = true;
    }

    if (editedUser.phone && !validatePhone(editedUser.phone)) {
      newErrors.phone = 'Telefone inválido';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(editedUser);
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader>
        <SheetTitle>{user ? "Editar Usuário" : "Adicionar Usuário"}</SheetTitle>
      </SheetHeader>
      <div>
        <Input
          placeholder="Nome"
          value={editedUser.name}
          onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
          error={fieldErrors.name}
        />
        <Input
          placeholder="CPF"
          value={editedUser.cpf}
          onChange={(e) => setEditedUser({ ...editedUser, cpf: e.target.value })}
          error={fieldErrors.cpf}
        />
        <Input
          placeholder="Email"
          value={editedUser.email}
          onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
          error={fieldErrors.email}
        />
        <Input
          placeholder="Telefone"
          value={editedUser.phone}
          onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
          error={fieldErrors.phone}
        />
        <Button onClick={() => handleSave()}>Salvar</Button>
        <Button onClick={() => handleSave(true)}>Salvar e Adicionar Outro</Button>
      </div>
    </Sheet>
  );
}
