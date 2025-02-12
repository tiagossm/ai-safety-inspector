
import { DashboardLayout } from "@/components/DashboardLayout";
import { CompanyForm } from "@/components/CompanyForm";
import { CompaniesList } from "@/components/CompaniesList";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const Companies = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleCompanyCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const filename = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('company-imports')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      const { error: importError } = await supabase
        .from('company_imports')
        .insert({
          user_id: user.id,
          filename: file.name,
          status: 'pending'
        });

      if (importError) throw importError;

      toast({
        title: "Upload realizado com sucesso",
        description: "O arquivo será processado em breve.",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Empresas Cadastradas</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Input
                type="file"
                accept=".csv"
                className="hidden"
                id="csv-upload"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('csv-upload')?.click()}
                disabled={uploading}
                className="min-w-[140px]"
              >
                <Upload className="h-5 w-5 mr-2" />
                Importar CSV
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="min-w-[180px]">
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
                </DialogHeader>
                <CompanyForm onCompanyCreated={handleCompanyCreated} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CompaniesList key={refreshTrigger} />
      </div>
    </DashboardLayout>
  );
}

export default Companies;
