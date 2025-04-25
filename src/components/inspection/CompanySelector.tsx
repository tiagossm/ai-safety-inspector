
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronDown, Building, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CompanyQuickCreateModal } from "./CompanyQuickCreateModal";

interface CompanySelectorProps {
  value: string;
  onSelect: (id: string, data: any) => void;
  className?: string;
}

export function CompanySelector({ value, onSelect, className }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (value && !selectedCompany) {
      fetchCompanyById(value);
    }
  }, [value]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address")
        .eq("status", "active")  // Only active companies
        .order("fantasy_name", { ascending: true });

      if (error) throw error;
      setCompanies(data || []);

      // If we have a value but no selectedCompany yet, find it in the fetched data
      if (value && !selectedCompany) {
        const found = data?.find(c => c.id === value);
        if (found) {
          setSelectedCompany(found);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedCompany(data);
      }
    } catch (error) {
      console.error("Erro ao buscar empresa por ID:", error);
    }
  };

  const handleSelectCompany = (company: any) => {
    setSelectedCompany(company);
    onSelect(company.id, company);
    setOpen(false);
  };

  const handleQuickCreateSuccess = (company: any) => {
    // Add the new company to the list and select it
    setCompanies([...companies, company]);
    handleSelectCompany(company);
  };

  return (
    <>
      <div className="flex gap-2 items-center w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground",
                className
              )}
            >
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                {selectedCompany ? (
                  <span>{selectedCompany.fantasy_name}</span>
                ) : (
                  <span className="text-muted-foreground">Selecione uma empresa</span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0">
            <Command>
              <CommandInput placeholder="Buscar empresas..." />
              <CommandList>
                <CommandEmpty>
                  {loading ? "Carregando..." : "Nenhuma empresa encontrada"}
                </CommandEmpty>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.fantasy_name}
                      onSelect={() => handleSelectCompany(company)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          company.id === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium">{company.fantasy_name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          CNPJ: {company.cnpj} {company.cnae && `• CNAE: ${company.cnae}`}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button 
          type="button" 
          size="icon" 
          variant="outline"
          title="Adicionar nova empresa"
          onClick={() => setIsQuickCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <CompanyQuickCreateModal
        open={isQuickCreateOpen}
        onOpenChange={setIsQuickCreateOpen}
        onSuccess={handleQuickCreateSuccess}
      />
    </>
  );
}
