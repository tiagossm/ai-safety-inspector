
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "./ui/use-toast";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { CIPADimensioning } from "@/types/cipa";

interface CompanyEditDialogProps {
  company: Company;
  onClose: () => void;
  onSave: () => Promise<void>;
  open: boolean;
}

export function CompanyEditDialog({
  company,
  onClose,
  onSave,
  open,
}: CompanyEditDialogProps) {
  const { toast } = useToast();
  const [editedCompany, setEditedCompany] = useState<Company>({ ...company });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Se o número de funcionários mudou, precisamos recalcular o dimensionamento da CIPA
      let cipaDimensioning: CIPADimensioning | null = null;
      
      if (editedCompany.employee_count !== company.employee_count && 
          editedCompany.cnae && 
          editedCompany.metadata?.risk_grade) {
            
        const riskLevel = parseInt(editedCompany.metadata.risk_grade);
        
        // Caso especial para empresas pequenas com risco 4
        if (editedCompany.employee_count && editedCompany.employee_count < 20 && riskLevel === 4) {
          cipaDimensioning = {
            message: 'Designar 1 representante da CIPA',
            norma: 'NR-5'
          };
        } else {
          // Calcular dimensionamento normal
          const { data, error } = await supabase.rpc('get_cipa_dimensioning', {
            p_employee_count: editedCompany.employee_count,
            p_cnae: editedCompany.cnae.replace(/[^\d]/g, ''),
            p_risk_level: riskLevel
          });
          
          if (!error && data && typeof data === 'object') {
            const dimensioningData = data as Record<string, any>;
            
            if ('norma' in dimensioningData) {
              cipaDimensioning = {
                norma: String(dimensioningData.norma),
                efetivos: typeof dimensioningData.efetivos === 'number' ? dimensioningData.efetivos : undefined,
                suplentes: typeof dimensioningData.suplentes === 'number' ? dimensioningData.suplentes : undefined,
                efetivos_empregador: typeof dimensioningData.efetivos_empregador === 'number' ? dimensioningData.efetivos_empregador : undefined,
                suplentes_empregador: typeof dimensioningData.suplentes_empregador === 'number' ? dimensioningData.suplentes_empregador : undefined,
                efetivos_empregados: typeof dimensioningData.efetivos_empregados === 'number' ? dimensioningData.efetivos_empregados : undefined,
                suplentes_empregados: typeof dimensioningData.suplentes_empregados === 'number' ? dimensioningData.suplentes_empregados : undefined,
                observacao: typeof dimensioningData.observacao === 'string' ? dimensioningData.observacao : undefined,
                message: typeof dimensioningData.message === 'string' ? dimensioningData.message : undefined,
              };
            }
          }
        }
      }

      // Atualizando metadados se necessário
      const metadata = { ...editedCompany.metadata };
      if (cipaDimensioning) {
        metadata.cipa_dimensioning = cipaDimensioning;
      }

      const { error } = await supabase
        .from('companies')
        .update({
          fantasy_name: editedCompany.fantasy_name,
          cnpj: editedCompany.cnpj,
          cnae: editedCompany.cnae,
          contact_email: editedCompany.contact_email,
          contact_phone: editedCompany.contact_phone,
          contact_name: editedCompany.contact_name,
          employee_count: editedCompany.employee_count,
          address: editedCompany.address,
          metadata: metadata
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
      
      await onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Fantasia */}
          <div>
            <label className="text-sm font-medium" htmlFor="fantasy_name">
              Nome Fantasia
            </label>
            <Input
              id="fantasy_name"
              value={editedCompany.fantasy_name || ""}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, fantasy_name: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="text-sm font-medium" htmlFor="cnpj">
              CNPJ
            </label>
            <Input
              id="cnpj"
              value={editedCompany.cnpj}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, cnpj: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* CNAE */}
          <div>
            <label className="text-sm font-medium" htmlFor="cnae">
              CNAE
            </label>
            <Input
              id="cnae"
              value={editedCompany.cnae || ""}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, cnae: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="text-sm font-medium" htmlFor="address">
              Endereço
            </label>
            <Input
              id="address"
              value={editedCompany.address || ""}
              onChange={(e) =>
                setEditedCompany({ ...editedCompany, address: e.target.value })
              }
              disabled={loading}
            />
          </div>

          {/* Quantidade de funcionários */}
          <div>
            <label className="text-sm font-medium" htmlFor="employee_count">
              Quantidade de Funcionários
            </label>
            <Input
              id="employee_count"
              type="number"
              value={editedCompany.employee_count || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  employee_count: parseInt(e.target.value) || null,
                })
              }
              disabled={loading}
            />
          </div>

          {/* E-mail de contato */}
          <div>
            <label className="text-sm font-medium" htmlFor="contact_email">
              E-mail
            </label>
            <Input
              id="contact_email"
              type="email"
              autoComplete="email"
              value={editedCompany.contact_email || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  contact_email: e.target.value,
                })
              }
              disabled={loading}
            />
          </div>

          {/* Telefone de contato */}
          <div>
            <label className="text-sm font-medium" htmlFor="contact_phone">
              Telefone
            </label>
            <Input
              id="contact_phone"
              type="tel"
              autoComplete="tel"
              value={editedCompany.contact_phone || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  contact_phone: e.target.value,
                })
              }
              disabled={loading}
            />
          </div>

          {/* Nome do Contato */}
          <div>
            <label className="text-sm font-medium" htmlFor="contact_name">
              Nome do Contato
            </label>
            <Input
              id="contact_name"
              value={editedCompany.contact_name || ""}
              onChange={(e) =>
                setEditedCompany({
                  ...editedCompany,
                  contact_name: e.target.value,
                })
              }
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
