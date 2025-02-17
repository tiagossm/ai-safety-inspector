
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanySearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function CompanySearchFilter({ searchTerm, onSearchChange }: CompanySearchFilterProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Buscar por nome ou CNPJ..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
