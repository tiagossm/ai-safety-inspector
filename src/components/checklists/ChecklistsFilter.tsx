
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/hooks/checklist/useFilterChecklists";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

interface ChecklistsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  totalChecklists: number;
}

export function ChecklistsFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  selectedCompanyId,
  setSelectedCompanyId,
  totalChecklists
}: ChecklistsFilterProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name', { ascending: true });
          
        if (error) {
          console.error("Error fetching companies for filter:", error);
          throw error;
        }
        
        console.log("Companies loaded for filter:", data?.length || 0);
        setCompanies(data || []);
      } catch (error) {
        console.error("Error in fetchCompanies for filter:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  const filterTypeLabels = {
    all: "Todos",
    active: "Ativos",
    inactive: "Inativos",
    templates: "Templates",
    my: "Meus Checklists"
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar checklists por título, descrição ou categoria..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{filterTypeLabels[filterType]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
              <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="active">Ativos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="inactive">Inativos</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="templates">Templates</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="my">Meus Checklists</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Select
          value={selectedCompanyId || ""}
          onValueChange={(value) => setSelectedCompanyId(value === "" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as empresas</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.fantasy_name || 'Empresa sem nome'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
