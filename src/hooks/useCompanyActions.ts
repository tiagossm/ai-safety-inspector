
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyStatus } from '@/types/company';
import { useToast } from '@/components/ui/use-toast';

export function useCompanyActions() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const toggleStatus = async (id: string, status: CompanyStatus) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          status,
          deactivated_at: status === 'inactive' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: status === 'active' ? 'Empresa ativada' : 'Empresa desativada',
        description: 'O status da empresa foi atualizado com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar status da empresa:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteCompany = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      // Método 1: Deletar permanentemente (cuidado!)
      // const { error } = await supabase.from('companies').delete().eq('id', id);
      
      // Método 2: "Soft delete" - Mais seguro, apenas marca como arquivado
      const { error } = await supabase
        .from('companies')
        .update({
          status: 'archived',
          deactivated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Empresa excluída',
        description: 'A empresa foi removida com sucesso.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível remover a empresa. Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return {
    toggleStatus,
    deleteCompany,
    loading
  };
}
