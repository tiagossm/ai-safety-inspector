
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyOption, CategoryOption, SortOrder } from "@/hooks/new-checklist/useChecklistFilter";

interface ChecklistFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: "all" | "active" | "inactive" | "template";
  setFilterType: (value: "all" | "active" | "inactive" | "template") => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (value: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
  companies: CompanyOption[];
  categories: CategoryOption[];
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
  sortOrder,
  setSortOrder,
  companies,
  categories,
  isLoadingCompanies,
  totalChecklists,
  onCreateNew
}: ChecklistFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar checklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={selectedCompanyId || "all"}
            onValueChange={(value) => setSelectedCompanyId(value === "all" ? null : value)}
            disabled={isLoadingCompanies || companies.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
            disabled={categories.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as SortOrder)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onCreateNew}>Criar novo</Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {totalChecklists} {totalChecklists === 1 ? 'checklist' : 'checklists'} encontrados
        </p>
      </div>
    </div>
  );
}
