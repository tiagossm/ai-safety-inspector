
import { useState, useEffect } from "react";
import { Check, ChevronDown, Building, Plus, Loader2 } from "lucide-react";
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
import { fetchCompanies, searchCompaniesByName } from "@/services/company/companyService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; // Added missing import

interface CompanySelectorProps {
  value: string;
  onSelect: (id: string, data: any) => void;
  className?: string;
  disabled?: boolean;
}

export function CompanySelector({ value, onSelect, className, disabled = false }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCompanyList();
    }
  }, [open]);

  useEffect(() => {
    if (value && !selectedCompany) {
      fetchCompanyById(value);
    }
  }, [value]);

  const fetchCompanyList = async () => {
    setLoading(true);
    try {
      const data = await fetchCompanies();
      setCompanies(data);

      // If we have a value but no selectedCompany yet, find it in the fetched data
      if (value && !selectedCompany) {
        const found = data?.find(c => c.id === value);
        if (found) {
          setSelectedCompany(found);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast("Erro ao carregar lista de empresas");
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
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const company = {
          id: data.id,
          name: data.fantasy_name || 'Empresa sem nome',
          fantasy_name: data.fantasy_name || 'Empresa sem nome',
          cnpj: data.cnpj || '',
          cnae: data.cnae || '',
          address: data.address || ''
        };
        setSelectedCompany(company);
      }
    } catch (error) {
      console.error("Erro ao buscar empresa por ID:", error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setSearching(true);
      const data = await searchCompaniesByName(query);
      setCompanies(data);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCompany = (company: any) => {
    console.log("Selecting company:", company);
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
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal",
                !value && "text-muted-foreground",
                className
              )}
            >
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                {selectedCompany ? (
                  <span className="truncate">{selectedCompany.name || selectedCompany.fantasy_name}</span>
                ) : (
                  <span className="text-muted-foreground">Selecione uma empresa</span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0">
            <Command>
              <CommandInput 
                placeholder="Buscar empresas..." 
                onValueChange={handleSearch} 
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : searching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Buscando...
                    </div>
                  ) : (
                    "Nenhuma empresa encontrada"
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name || company.fantasy_name}
                      onSelect={() => handleSelectCompany(company)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          company.id === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium">{company.name || company.fantasy_name}</div>
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
          disabled={disabled}
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
