
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User } from "@/types/user";
import { Loader2, Mail, Phone, Building2, UserRound, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from "react-input-mask";

interface UserDataTabProps {
  user: Omit<User, "id"> | User;
  isNew: boolean;
  loading: boolean;
  onUserChange: (field: keyof User, value: string) => void;
  onResetPassword?: () => Promise<void>;
  onSendWelcomeEmail?: () => Promise<void>;
}

export function UserDataTab({ 
  user, 
  isNew, 
  loading,
  onUserChange,
  onResetPassword,
  onSendWelcomeEmail
}: UserDataTabProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleResetPassword = async () => {
    if (onResetPassword) {
      setIsResetting(true);
      await onResetPassword();
      setIsResetting(false);
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (onSendWelcomeEmail) {
      setIsSendingEmail(true);
      await onSendWelcomeEmail();
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{user.name || "Novo Usuário"}</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetPassword}
              disabled={isNew || isResetting || loading}
            >
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resetar Senha
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendWelcomeEmail}
              disabled={isNew || isSendingEmail || loading}
            >
              {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Email de Boas-vindas
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="name"
              placeholder="Nome completo"
              value={user.name}
              onChange={(e) => onUserChange("name", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={user.email}
              onChange={(e) => onUserChange("email", e.target.value)}
              className="pl-10"
              disabled={!isNew}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <InputMask
              mask="(99) 99999-9999"
              value={user.phone || ""}
              onChange={(e) => onUserChange("phone", e.target.value)}
            >
              {(inputProps: any) => (
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                  {...inputProps}
                />
              )}
            </InputMask>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="position"
              placeholder="Cargo ou função"
              value={user.position || ""}
              onChange={(e) => onUserChange("position", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="status">Status da conta</Label>
          <Switch
            id="status"
            checked={user.status === "active"}
            onCheckedChange={(checked) => 
              onUserChange("status", checked ? "active" : "inactive")
            }
          />
        </div>

        {!isNew && user.created_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Criado em {format(new Date(user.created_at), "PPP", { locale: ptBR })}
          </div>
        )}

        {!isNew && user.last_activity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Última atividade em {format(new Date(user.last_activity), "PPP 'às' p", { locale: ptBR })}
          </div>
        )}
      </div>
    </div>
  );
}
