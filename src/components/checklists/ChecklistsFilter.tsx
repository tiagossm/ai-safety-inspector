
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { FilterType } from "@/hooks/checklist/useFilterChecklists";

interface ChecklistsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  totalChecklists: number;
}

export function ChecklistsFilter({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  totalChecklists
}: ChecklistsFilterProps) {
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por título, descrição..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filterType === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterType("all")}
        >
          Todos ({totalChecklists})
        </Badge>
        <Badge
          variant={filterType === "active" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterType("active")}
        >
          Ativos
        </Badge>
        <Badge
          variant={filterType === "inactive" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterType("inactive")}
        >
          Inativos
        </Badge>
        <Badge
          variant={filterType === "templates" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterType("templates")}
        >
          Templates
        </Badge>
        <Badge
          variant={filterType === "my" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterType("my")}
        >
          Meus Checklists
        </Badge>
      </div>
    </div>
  );
}
