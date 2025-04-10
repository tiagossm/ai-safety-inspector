import React, { useState, useEffect } from "react";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Building, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";

interface CompanySelectorProps {
  value?: string;
  onSelect: (value: string, companyData: any) => void;
}

export function CompanySelector({ value, onSelect }: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    fantasy_name: "",
    cnpj: "",
    cnae: "",
    address: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    employee_count: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj, cnae, address, contact_name, contact_email, contact_phone")
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = value ? companies.find(company => company.id === value) : null;

  const handleSelectCompany = (companyId: string) => {
    const selectedCompany = companies.find(company => company.id === companyId);
    if (selectedCompany) {
      onSelect(companyId, selectedCompany);
    }
    setOpen(false);
  };

  const handleCreateCompany = async () => {
    try {
      if (!user || !user.id) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      if (!newCompany.fantasy_name || !newCompany.cnpj) {
        toast.error("Nome e CNPJ são obrigatórios");
        return;
      }
      
      const formattedCNPJ = newCompany.cnpj.replace(/\D/g, "");
      
      if (formattedCNPJ.length !== 14) {
        toast.error("CNPJ deve ter 14 dígitos");
        return;
      }

      let riskGrade = 2;
      if (newCompany.cnae) {
        try {
          const { data: riskData } = await supabase
            .from("nr4_riscos")
            .select("grau_risco")
            .eq("cnae", newCompany.cnae)
            .single();
            
          if (riskData) {
            riskGrade = riskData.grau_risco;
          }
        } catch (err) {
          console.warn("Error fetching risk grade:", err);
        }
      }
      
      const employeeCount = newCompany.employee_count ? 
        parseInt(newCompany.employee_count) : 
        undefined;
      
      const { data, error } = await supabase
        .from("companies")
        .insert({
          fantasy_name: newCompany.fantasy_name,
          cnpj: formattedCNPJ,
          cnae: newCompany.cnae,
          address: newCompany.address,
          contact_name: newCompany.contact_name,
          contact_email: newCompany.contact_email,
          contact_phone: newCompany.contact_phone,
          employee_count: employeeCount,
          status: "active",
          user_id: user.id,
          metadata: {
            risk_grade: riskGrade.toString(),
            main_activity: newCompany.cnae ? undefined : "Não informada"
          }
        })
        .select("*")
        .single();
      
      if (error) throw error;
      
      toast.success("Empresa criada com sucesso!");
      setShowCreateDialog(false);
      
      await fetchCompanies();
      
      if (data) {
        onSelect(data.id, data);
      }
      
      setNewCompany({
        fantasy_name: "",
        cnpj: "",
        cnae: "",
        address: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        employee_count: ""
      });
      
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(`Erro ao criar empresa: ${error.message}`);
    }
  };

  const filteredCompanies = searchQuery
    ? companies.filter(company => 
        company.fantasy_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.cnpj?.includes(searchQuery.replace(/\D/g, ""))
      )
    : companies;

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value && selectedCompany ? (
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <span>{selectedCompany.fantasy_name}</span>
                {selectedCompany.cnpj && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {selectedCompany.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Selecione uma empresa</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom" sideOffset={8} style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command>
            <CommandInput 
              placeholder="Buscar empresa..." 
              className="h-9" 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p>Nenhuma empresa encontrada.</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setOpen(false);
                      setShowCreateDialog(true);
                    }}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar nova empresa
                  </Button>
                </div>
              </CommandEmpty>
              
              <CommandGroup>
                {filteredCompanies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.id}
                    onSelect={() => handleSelectCompany(company.id)}
                    className="flex justify-between"
                  >
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      <span>{company.fantasy_name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {company.cnpj && (
                        <Badge variant="outline" className="mr-2 text-xs">
                          {company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                        </Badge>
                      )}
                      {company.id === value && <Check className="h-4 w-4" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <div className="border-t p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-center"
                  onClick={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar nova empresa
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados da empresa para criar um novo cadastro.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="fantasy_name">Nome da Empresa</Label>
                <Input
                  id="fantasy_name"
                  value={newCompany.fantasy_name}
                  onChange={(e) => setNewCompany({ ...newCompany, fantasy_name: e.target.value })}
                  placeholder="Nome fantasia da empresa"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={newCompany.cnpj}
                  onChange={(e) => setNewCompany({ ...newCompany, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cnae">CNAE</Label>
                <Input
                  id="cnae"
                  value={newCompany.cnae}
                  onChange={(e) => setNewCompany({ ...newCompany, cnae: e.target.value })}
                  placeholder="00.00-0"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                  placeholder="Endereço completo"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="contact_name">Nome do Contato</Label>
                <Input
                  id="contact_name"
                  value={newCompany.contact_name}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_name: e.target.value })}
                  placeholder="Nome completo"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Email do Contato</Label>
                <Input
                  id="contact_email"
                  value={newCompany.contact_email}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Telefone do Contato</Label>
                <Input
                  id="contact_phone"
                  value={newCompany.contact_phone}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="employee_count">Número de Funcionários</Label>
                <Input
                  id="employee_count"
                  type="number"
                  value={newCompany.employee_count || ""}
                  onChange={(e) => setNewCompany({ 
                    ...newCompany, 
                    employee_count: e.target.value 
                  })}
                  placeholder="Ex: 100"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCompany}>
              Criar Empresa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
