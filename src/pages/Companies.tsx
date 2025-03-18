
import { useAuth } from "@/components/AuthProvider";
import { CompaniesList } from "@/components/CompaniesList";
import { Button } from "@/components/ui/button";
import { Upload, Download, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaUpload } from "@/components/media/MediaUpload";

const Companies = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);

  // 🚀 Busca as empresas do Supabase
  const fetchCompanies = async () => {
    try {
      console.log("🔍 Buscando empresas no Supabase...");
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("status", "active");
        
      if (error) throw error;
      
      setCompanies(data);
      console.log("✅ Empresas carregadas:", data);
    } catch (error: any) {
      console.error("❌ Erro ao buscar empresas:", error.message);
      toast.error("Erro ao carregar empresas", {
        description: error.message || "Não foi possível carregar as empresas."
      });
    }
  };

  // 🚀 Atualiza a lista de empresas quando necessário
  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  const handleCompanyCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMediaUploaded = (mediaData: any) => {
    console.log("📁 Mídia enviada:", mediaData);
    toast.success("Arquivo enviado com sucesso!");
    setUploadDialogOpen(false);
  };

  const handleExportCompanies = async () => {
    try {
      console.log("📤 Exportando empresas...");

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("status", "active");

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

      toast.success("Exportação concluída", {
        description: "O arquivo CSV foi gerado com sucesso."
      });

      console.log("✅ Exportação concluída com sucesso!");
    } catch (error: any) {
      console.error("❌ Erro ao exportar empresas:", error.message);
      toast.error("Erro na exportação", {
        description: error.message || "Não foi possível exportar os dados."
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Erro no upload", {
        description: "Por favor, selecione um arquivo CSV válido."
      });
      return;
    }

    setUploading(true);
    try {
      if (!user) throw new Error("Usuário não autenticado");

      console.log("📤 Fazendo upload do arquivo:", file.name);

      const filename = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("company-imports")
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: importError } = await supabase
        .from("company_imports")
        .insert({
          user_id: user.id,
          filename: file.name,
          status: "pending",
        });

      if (importError) throw importError;

      toast.success("Upload realizado com sucesso", {
        description: "O arquivo será processado em breve."
      });
      setRefreshTrigger(prev => prev + 1);

      console.log("✅ Upload e importação concluídos!");
    } catch (error: any) {
      console.error("❌ Erro no upload:", error.message);
      toast.error("Erro no upload", {
        description: error.message || "Não foi possível fazer o upload do arquivo."
      });
    } finally {
      setUploading(false);
      e.target.value = "";
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
              onClick={() => document.getElementById("csv-upload")?.click()}
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
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Image className="h-5 w-5 mr-2" />
                  Upload Mídia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Arquivo de Mídia</DialogTitle>
                </DialogHeader>
                <MediaUpload onMediaUploaded={handleMediaUploaded} />
              </DialogContent>
            </Dialog>
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
      <CompaniesList />
    </div>
  );
};

export default Companies;
