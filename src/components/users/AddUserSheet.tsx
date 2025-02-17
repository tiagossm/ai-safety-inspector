
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserRole, validateRole } from "@/types/user";

interface AddUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newUser: Omit<User, 'id'>;
  onNewUserChange: (user: Omit<User, 'id'>) => void;
  onSave: () => void;
  trigger?: React.ReactNode;
}

export function AddUserSheet({
  open,
  onOpenChange,
  newUser,
  onNewUserChange,
  onSave,
  trigger
}: AddUserSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo Usuário</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="dados" className="mt-4">
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="space-y-4 mt-4">
            <Input 
              placeholder="Nome" 
              value={newUser.name} 
              onChange={(e) => onNewUserChange({ ...newUser, name: e.target.value })} 
            />
            <Input 
              placeholder="Email" 
              type="email" 
              value={newUser.email} 
              onChange={(e) => onNewUserChange({ ...newUser, email: e.target.value })} 
            />
          </TabsContent>
          <TabsContent value="atribuicoes">
            {/* Implementar seleção de empresas e checklists */}
          </TabsContent>
          <TabsContent value="permissoes">
            <select
              value={newUser.role}
              onChange={(e) => onNewUserChange({ ...newUser, role: validateRole(e.target.value) })}
              className="w-full border rounded-md p-2"
            >
              <option value="Técnico">Técnico</option>
              <option value="Gerente">Gerente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </TabsContent>
        </Tabs>
        <Button onClick={onSave} className="w-full mt-4">
          Salvar Usuário
        </Button>
      </SheetContent>
    </Sheet>
  );
}
