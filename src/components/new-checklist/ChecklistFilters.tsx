
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  ArrowDownAZ, 
  ArrowUpZA, 
  Filter,
  SlidersHorizontal, 
  Check, 
  X,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Company {
  id: string;
  fantasy_name: string;
}

interface ChecklistFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  selectedChecklists: string[];
  isBatchUpdating: boolean;
  onBatchUpdateStatus: (status: "active" | "inactive") => void;
  sortColumn: string;
  setSortColumn: (column: string) => void;
  sort: "asc" | "desc";
  setSort: (sort: "asc" | "desc") => void;
}

export function ChecklistFilters({
  search,
  setSearch,
  selectedChecklists,
  isBatchUpdating,
  onBatchUpdateStatus,
  sortColumn,
  setSortColumn,
  sort,
  setSort,
}: ChecklistFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrigin, setSelectedOrigin] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch companies and categories for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoading(true);
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("id, fantasy_name")
          .order("fantasy_name");
        
        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);
        
        // Fetch distinct categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("checklists")
          .select("category")
          .not("category", "is", null);
        
        if (categoriesError) throw categoriesError;
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(categoriesData?.map(item => item.category).filter(Boolean))
        );
        
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);

  // Function to set sort order and column
  const handleSortChange = (value: string) => {
    const [column, direction] = value.split("_");
    setSortColumn(column);
    setSort(direction as "asc" | "desc");
  };

  // Function to reset all filters
  const resetFilters = () => {
    setSearch("");
    setSelectedCompanyId("all");
    setSelectedStatus("all");
    setSelectedOrigin("all");
    setSelectedCategory("all");
    setSortColumn("title");
    setSort("asc");
  };

  // Count active filters
  const activeFiltersCount = [
    selectedCompanyId !== "all",
    selectedStatus !== "all",
    selectedOrigin !== "all",
    selectedCategory !== "all",
    search.trim().length > 0
  ].filter(Boolean).length;

  return (
    <Card className="border-muted bg-card">
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar checklists por título, descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={`${sortColumn}_${sort}`} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="title_asc">
                    <div className="flex items-center gap-2">
                      <ArrowDownAZ className="h-4 w-4" />
                      <span>Nome (A-Z)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="title_desc">
                    <div className="flex items-center gap-2">
                      <ArrowUpZA className="h-4 w-4" />
                      <span>Nome (Z-A)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created_at_desc">
                    <span>Mais recentes</span>
                  </SelectItem>
                  <SelectItem value="created_at_asc">
                    <span>Mais antigos</span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button
              variant={showAdvancedFilters ? "default" : "outline"}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex gap-2 items-center"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {selectedChecklists.length > 0 && (
              <TooltipProvider>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isBatchUpdating}
                        onClick={() => onBatchUpdateStatus("active")}
                        className="bg-background text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ativar {selectedChecklists.length} selecionados</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isBatchUpdating}
                        onClick={() => onBatchUpdateStatus("inactive")}
                        className="bg-background text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Desativar {selectedChecklists.length} selecionados</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t mt-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedCompanyId} 
              onValueChange={setSelectedCompanyId}
              disabled={isLoading || companies.length === 0}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.fantasy_name || `Empresa ${company.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
              disabled={isLoading || categories.length === 0}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="ia">IA</SelectItem>
                  <SelectItem value="csv">Planilha</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {activeFiltersCount > 0 && (
              <div className="col-span-full flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={resetFilters}
                  className="text-muted-foreground flex items-center gap-2"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
