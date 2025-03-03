
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChecklistFilter } from "@/types/checklist";

interface ChecklistsFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: ChecklistFilter;
  setFilterType: (value: ChecklistFilter) => void;
  totalChecklists: number;
}

export function ChecklistsFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  totalChecklists
}: ChecklistsFilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex items-center flex-1 gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar checklists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      
      <div className="w-full md:w-auto">
        <Select 
          value={filterType} 
          onValueChange={(value) => setFilterType(value as ChecklistFilter)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Checklists</SelectItem>
            <SelectItem value="templates">Apenas Templates</SelectItem>
            <SelectItem value="custom">Personalizados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
