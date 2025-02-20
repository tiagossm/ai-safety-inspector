
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyStatus } from "@/types/company";

export function useCompanyActions() {
  const { toast } = useToast();

  const handleToggleStatus = async (id: string, newStatus: CompanyStatus) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da empresa foi atualizado com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da empresa.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          status: 'archived',
          deactivated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Empresa arquivada",
        description: "A empresa foi arquivada com sucesso.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar a empresa.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    toggleStatus: handleToggleStatus,
    deleteCompany: handleDelete,
  };
}
