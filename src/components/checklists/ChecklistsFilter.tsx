
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CompanyListItem } from "@/hooks/checklist/useFilterChecklists";

interface ChecklistsFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load companies for the filter
  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name, name')
          .order('fantasy_name', { ascending: true });
        
        if (error) throw error;
        
        // Process data to ensure we have no empty values for Select.Item
        const processedCompanies = data.map(company => ({
          id: company.id,
          name: company.fantasy_name || company.name || "Empresa " + company.id.substring(0, 8)
        }));
        
        setCompanies(processedCompanies);
        console.log("Companies loaded for filter:", processedCompanies.length);
      } catch (error) {
        console.error("Error loading companies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-3">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipo</SelectLabel>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
                <SelectItem value="inativos">Inativos</SelectItem>
                <SelectItem value="templates">Templates</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={selectedCompanyId || ""}
            onValueChange={(value) => setSelectedCompanyId(value === "" ? null : value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Empresa</SelectLabel>
                <SelectItem value="todos">Todas as empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 px-3"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs font-medium">
              {totalChecklists}
            </span>
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {/* Additional filters would go here */}
            <div className="col-span-3 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("todos");
                  setSelectedCompanyId(null);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
