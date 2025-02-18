import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { User, UserRole, UserStatus } from "@/types/user";
import { UsersService } from "@/lib/services/users";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { RoleSelector } from "./role-selector/RoleSelector";

export const AddUserSheet = ({
  open,
  user,
  onClose,
  onSave,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [formData, setFormData] = useState<Omit<User, "id" | "createdAt">>({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    lastActivity: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        lastActivity: new Date().toISOString(),
      });
    }
    setErrors({});
  }, [user, open]);

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    } else {
      const isUnique = await UsersService.checkEmailUnique(
        formData.email,
        user?.id
      );
      if (!isUnique) newErrors.email = "E-mail já está em uso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})/, "$1-$2")
      .slice(0, 15);
    
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validateForm())) return;

    setLoading(true);
    try {
      if (user) {
        await UsersService.update(user.id, formData);
        toast.success("Usuário atualizado com sucesso");
      } else {
        await UsersService.create(formData);
        toast.success("Usuário criado com sucesso");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {user ? "Editar Usuário" : "Novo Usuário"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              hasError={!!errors.name}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-mail *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              hasError={!!errors.email}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <Input
              value={formData.phone}
              onChange={handlePhoneInput}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Empresa</label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Perfil *</label>
            <RoleSelector
              selectedRole={formData.role}
              onSelect={(role) => setFormData({ ...formData, role })}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Switch
              checked={formData.status === UserStatus.ACTIVE}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  status: checked ? UserStatus.ACTIVE : UserStatus.INACTIVE,
                })
              }
              id="user-status"
            />
            <label htmlFor="user-status" className="text-sm">
              {formData.status === UserStatus.ACTIVE ? "Ativo" : "Inativo"}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};