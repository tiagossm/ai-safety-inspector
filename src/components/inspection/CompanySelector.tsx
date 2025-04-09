
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CompanySelectorProps {
  value: string;
  onSelect: (companyId: string) => void;
  includeEmptyOption?: boolean;
}

export function CompanySelector({ 
  value, 
  onSelect,
  includeEmptyOption = false
}: CompanySelectorProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name', { ascending: true });
          
        if (error) throw error;
        
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma empresa" />
      </SelectTrigger>
      <SelectContent>
        {includeEmptyOption && (
          <SelectItem value="all">Todas as empresas</SelectItem>
        )}
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.fantasy_name}
          </SelectItem>
        ))}
        {loading && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
      </SelectContent>
    </Select>
  );
}
