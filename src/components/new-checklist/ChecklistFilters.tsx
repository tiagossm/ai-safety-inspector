
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
import { CompanyOption } from "@/hooks/new-checklist/useChecklistFilter";

interface ChecklistFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: "all" | "active" | "template";
  setFilterType: (value: "all" | "active" | "template") => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (value: string | null) => void;
  companies: CompanyOption[];
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
  companies,
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
        
        <div className="flex gap-2">
          <Select
            value={selectedCompanyId || ""}
            onValueChange={(value) => setSelectedCompanyId(value === "" ? null : value)}
            disabled={isLoadingCompanies || companies.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={onCreateNew}>Criar novo</Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center">
        <Tabs
          value={filterType}
          onValueChange={(value) => setFilterType(value as "all" | "active" | "template")}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <p className="text-sm text-muted-foreground mt-2 md:mt-0">
          {totalChecklists} {totalChecklists === 1 ? 'checklist' : 'checklists'} encontrados
        </p>
      </div>
    </div>
  );
}
