
import { useAuth } from "@/components/AuthProvider";
import { CompanyForm } from "@/components/CompanyForm";
import { CompaniesList } from "@/components/CompaniesList";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const Companies = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCompanyCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExportCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const csvContent = "data:text/csv;charset=utf-8," + 
        "CNPJ,Nome Fantasia,CNAE,Email,Telefone,Contato\n" +
        data.map(company => `${company.cnpj},${company.fantasy_name || ''},${company.cnae || ''},${company.contact_email || ''},${company.contact_phone || ''},${company.contact_name || ''}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "empresas.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "O arquivo CSV foi gerado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message || "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
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
    <div className="max-w-[2000px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Empresas Cadastradas</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={uploading}
              className="whitespace-nowrap"
            >
              <Upload className="h-5 w-5 mr-2" />
              Importar CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportCompanies}
              className="whitespace-nowrap"
            >
              <Download className="h-5 w-5 mr-2" />
              Exportar CSV
            </Button>
          </div>
          <Input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>
      </div>
      <CompaniesList key={refreshTrigger} />
    </div>
  );
}

export default Companies;
