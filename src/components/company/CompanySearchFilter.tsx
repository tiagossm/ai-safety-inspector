
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCNPJ } from "@/utils/formatters";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface CompanySearchFilterProps {
  searchTerm: string;
  searchType: 'name' | 'cnpj';
  onSearchChange: (value: string) => void;
  onSearchTypeChange: (value: 'name' | 'cnpj') => void;
  onSearch: () => void;
  searching?: boolean;
}

export function CompanySearchFilter({ 
  searchTerm, 
  searchType,
  onSearchChange, 
  onSearchTypeChange,
  onSearch,
  searching = false 
}: CompanySearchFilterProps) {
  return (
    <div className="flex w-full max-w-2xl gap-2 flex-col sm:flex-row">
      <div className="flex-1 flex gap-2">
        <Select value={searchType} onValueChange={onSearchTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Buscar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome Fantasia</SelectItem>
            <SelectItem value="cnpj">CNPJ</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder={searchType === 'name' ? "Buscar por nome fantasia..." : "Buscar por CNPJ..."}
            className="pl-10 h-12 text-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => {
              let value = e.target.value;
              if (searchType === 'cnpj') {
                value = formatCNPJ(value);
              }
              onSearchChange(value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
      </div>
      
      <Button 
        onClick={onSearch}
        disabled={searching}
        className="h-12 min-w-[100px]"
      >
        {searching ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Search className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Buscar</span>
          </>
        )}
      </Button>
    </div>
  );
}
