
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { UserRole, UserStatus } from "@/types/user";
import { RoleSelector } from "./role-selector/RoleSelector";

const userFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  email_secondary: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  phone_secondary: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus)
});

type UserFormData = z.infer<typeof userFormSchema>;

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<UserFormData>;
  isLoading?: boolean;
}

export function AddUserSheet({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading
}: AddUserSheetProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      ...initialData
    }
  });

  const selectedRole = watch('role');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initialData ? "Editar Usuário" : "Novo Usuário"}</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                {...register("name")}
                className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.name && (
                <span className="text-sm text-destructive">{errors.name.message}</span>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={`mt-1 ${errors.email ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="text-sm text-destructive">{errors.email.message}</span>
              )}
            </div>

            <div>
              <Label htmlFor="email_secondary">Email Secundário</Label>
              <Input
                id="email_secondary"
                type="email"
                {...register("email_secondary")}
                className={`mt-1 ${errors.email_secondary ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.email_secondary && (
                <span className="text-sm text-destructive">{errors.email_secondary.message}</span>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone")}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="phone_secondary">Telefone Secundário</Label>
              <Input
                id="phone_secondary"
                {...register("phone_secondary")}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                {...register("cpf")}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label>Função</Label>
              <RoleSelector
                selectedRole={selectedRole}
                onSelect={(role) => {
                  const event = {
                    target: { value: role }
                  };
                  register("role").onChange(event);
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
