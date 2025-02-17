
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  fantasy_name: string;
}

interface AssignCompaniesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  selectedCompanies: string[];
  onCompaniesChange: (companies: string[]) => void;
}

export function AssignCompaniesDialog({
  open,
  onOpenChange,
  userId,
  selectedCompanies,
  onCompaniesChange,
}: AssignCompaniesDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadCompanies();
    }
  }, [open]);

  const loadCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("id, fantasy_name")
      .eq("status", "active")
      .order("fantasy_name");

    if (!error && data) {
      setCompanies(data);
    }
    setLoading(false);
  };

  const filteredCompanies = companies.filter(company =>
    company.fantasy_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atribuir Empresas</DialogTitle>
          <DialogDescription>
            Selecione as empresas que este usuário poderá acessar
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center p-4">Carregando...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              Nenhuma empresa encontrada
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                <Checkbox
                  id={company.id}
                  checked={selectedCompanies.includes(company.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onCompaniesChange([...selectedCompanies, company.id]);
                    } else {
                      onCompaniesChange(selectedCompanies.filter(id => id !== company.id));
                    }
                  }}
                />
                <label
                  htmlFor={company.id}
                  className="flex-grow cursor-pointer text-sm"
                >
                  {company.fantasy_name}
                </label>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
