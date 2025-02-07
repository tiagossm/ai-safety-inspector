import { DashboardLayout } from "@/components/DashboardLayout";
import { CompanyForm } from "@/components/CompanyForm";
import { CompaniesList } from "@/components/CompaniesList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Companies = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCompanyCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Empresas Cadastradas</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
              </DialogHeader>
              <CompanyForm onCompanyCreated={handleCompanyCreated} />
            </DialogContent>
          </Dialog>
        </div>
        <CompaniesList key={refreshTrigger} />
      </div>
    </DashboardLayout>
  );
}

export default Companies;