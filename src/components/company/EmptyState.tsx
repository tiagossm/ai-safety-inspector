
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface EmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

export function EmptyState({ searchTerm, onClearSearch }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>Nenhum resultado encontrado para "{searchTerm}"</p>
      <Button 
        variant="link" 
        onClick={onClearSearch}
        className="mt-2"
      >
        <Search className="h-4 w-4 mr-2" />
        Limpar busca
      </Button>
    </div>
  );
}
