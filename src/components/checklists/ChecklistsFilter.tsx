
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, descrição ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          Todos
        </Button>
        <Button
          variant={filterType === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("active")}
        >
          Ativos
        </Button>
        <Button
          variant={filterType === "inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("inactive")}
        >
          Inativos
        </Button>
        <Button
          variant={filterType === "templates" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("templates")}
        >
          Templates
        </Button>
        <Button
          variant={filterType === "my" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("my")}
        >
          Meus Checklists
        </Button>
      </div>
    </div>
  );
}
