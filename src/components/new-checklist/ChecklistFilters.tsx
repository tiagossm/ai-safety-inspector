
import React from "react";
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
import { CompanyListItem } from "@/hooks/checklist/useFilterChecklists";
import { SearchX, Plus, Bot, FileSpreadsheet, FilePenLine, ArrowDownAZ, ArrowUpZA } from "lucide-react";

interface ChecklistFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedOrigin?: string;
  setSelectedOrigin?: (origin: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  companies: CompanyListItem[];
  categories: string[];
  isLoadingCompanies: boolean;
  totalChecklists: number;
  onCreateNew: () => void;
}

export function ChecklistFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  selectedCompanyId,
  setSelectedCompanyId,
  selectedCategory,
  setSelectedCategory,
  selectedOrigin = "all",
  setSelectedOrigin,
  sortOrder,
  setSortOrder,
  companies,
  categories,
  isLoadingCompanies,
  totalChecklists,
  onCreateNew,
}: ChecklistFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <Input
            placeholder="Pesquisar checklists"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <SearchX className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="col-span-1">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="col-span-1">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="created_desc">
                  <div className="flex items-center">
                    <ArrowUpZA className="mr-2 h-4 w-4" />
                    Mais recentes
                  </div>
                </SelectItem>
                <SelectItem value="created_asc">
                  <div className="flex items-center">
                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                    Mais antigos
                  </div>
                </SelectItem>
                <SelectItem value="title_asc">
                  <div className="flex items-center">
                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                    Nome (A-Z)
                  </div>
                </SelectItem>
                <SelectItem value="title_desc">
                  <div className="flex items-center">
                    <ArrowUpZA className="mr-2 h-4 w-4" />
                    Nome (Z-A)
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onCreateNew} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Checklist
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          value={selectedCompanyId}
          onValueChange={setSelectedCompanyId}
          disabled={isLoadingCompanies}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.fantasy_name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
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
        
        {setSelectedOrigin && (
          <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as origens" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="manual">
                  <div className="flex items-center">
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Criação Manual
                  </div>
                </SelectItem>
                <SelectItem value="ia">
                  <div className="flex items-center">
                    <Bot className="mr-2 h-4 w-4" />
                    Gerado por IA
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Importado de Planilha
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Exibindo {totalChecklists} {totalChecklists === 1 ? 'checklist' : 'checklists'}
      </div>
    </div>
  );
}
