
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CompanyForm } from "@/components/CompanyForm";

interface EmptyCompanyStateProps {
  onCompanyCreated: () => void;
}

export function EmptyCompanyState({ onCompanyCreated }: EmptyCompanyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-6xl animate-bounce">👻</div>
      <h3 className="text-xl font-semibold text-center">
        Nenhuma empresa cadastrada
      </h3>
      <p className="text-muted-foreground text-center">
        Comece adicionando sua primeira empresa!
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="mt-4">
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Empresa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
          </DialogHeader>
          <CompanyForm onCompanyCreated={onCompanyCreated} />
        </DialogContent>
      </Dialog>
      
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg"
        onClick={() => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="new-company"]')?.click()}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
