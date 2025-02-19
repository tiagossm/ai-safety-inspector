
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompanySearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  searching?: boolean;
}

export function CompanySearchFilter({ 
  searchTerm, 
  onSearchChange, 
  onSearch,
  searching = false 
}: CompanySearchFilterProps) {
  return (
    <div className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          className="pl-10 h-12 text-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <Button 
        onClick={onSearch}
        disabled={searching}
        className="h-12"
      >
        {searching ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        <span className="ml-2 hidden sm:inline">Buscar</span>
      </Button>
    </div>
  );
}
