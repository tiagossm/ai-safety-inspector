import { useAuth } from "@/components/AuthProvider";
import { CompanyForm } from "@/components/CompanyForm";
import { CompaniesList } from "@/components/CompaniesList";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_ANON_KEY = "SUA_API_KEY_AQUI"; // 🔴 Insira sua API Key correta
const SUPABASE_URL = "https://jkgmgjjtslkozhehwmng.supabase.co";

const Companies = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);

  // 🚀 Busca as empresas do Supabase
  const fetchCompanies = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/companies?select=*&status=eq.active`,
        {
          method: "GET",
          headers: {
            "apikey": SUPABASE_ANON_KEY, // 🔴 API Key correta
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.statusText}`);
      }

      const data = await response.json();
      setCompanies(data);
      console.log("✅ Empresas carregadas:", data);
    } catch (error: any) {
      console.error("Erro ao buscar empresas:", error.message);
      toast({
        title: "Erro ao carregar empresas",
        description: error.message || "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    }
  };

  // 🚀 Busca as empresas quando a página carrega ou quando há atualização
  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  return (
    <div className="max-w-[2000px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Empresas Cadastradas</h2>
      </div>
      <CompaniesList key={refreshTrigger} companies={companies} />
    </div>
  );
};

export default Companies;
