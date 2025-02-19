
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanySearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function CompanySearchFilter({ searchTerm, onSearchChange }: CompanySearchFilterProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        placeholder="Buscar por nome ou CNPJ..."
        className="pl-10 h-12 text-lg border-2 focus-visible:ring-2 focus-visible:ring-primary"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
