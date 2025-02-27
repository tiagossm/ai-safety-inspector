
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Company } from "@/types/company";
import { CompanyDetails } from "../CompanyDetails";
import { CompanyContacts } from "../CompanyContacts";
import { CompanyUnits } from "../CompanyUnits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export const CompanyDetailDialog = ({ open, onOpenChange, company }: CompanyDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({...company});
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          fantasy_name: editedCompany.fantasy_name,
          cnae: editedCompany.cnae,
          address: editedCompany.address,
          employee_count: editedCompany.employee_count,
          contact_name: editedCompany.contact_name,
          contact_phone: editedCompany.contact_phone,
          contact_email: editedCompany.contact_email,
        })
        .eq('id', company.id);

      if (error) throw error;
      
      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
        variant: "default",
      });
      
      setIsEditing(false);
      // Idealmente aqui você recarregaria os dados da empresa para atualizar a UI
    } catch (error: any) {
      console.error("Erro ao atualizar empresa:", error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Company, value: any) => {
    setEditedCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderViewMode = () => (
    <div className="space-y-6 bg-background text-foreground p-4 rounded-md">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Detalhes da Empresa: {company.fantasy_name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>CNPJ:</strong> {company.cnpj}</p>
            <p><strong>Nome Fantasia:</strong> {company.fantasy_name}</p>
            <p><strong>CNAE:</strong> {company.cnae || "Não informado"}</p>
            <p><strong>Grau de Risco (NR-4):</strong> {company.metadata?.risk_grade || "Não informado"}</p>
            <p><strong>Endereço:</strong> {company.address || "Não informado"}</p>
          </div>
          <div>
            <p><strong>Quantidade de Funcionários:</strong> {company.employee_count || "Não informado"}</p>
            <p><strong>Nome do Contato:</strong> {company.contact_name || "Não informado"}</p>
            <p><strong>Telefone:</strong> {company.contact_phone || "Não informado"}</p>
            <p><strong>E-mail:</strong> {company.contact_email || "Não informado"}</p>
            {company.metadata?.cipa_dimensioning && (
              <p><strong>Dimensionamento:</strong> {
                `${company.metadata.cipa_dimensioning.efetivos} membros, ${company.metadata.cipa_dimensioning.suplentes} suplentes (${company.metadata.cipa_dimensioning.norma})`
              }</p>
            )}
            {company.employee_count && company.employee_count < 20 && company.metadata?.risk_grade === "4" && (
              <p><strong>Dimensionamento:</strong> <Badge variant="outline">Designar 1 representante da CIPA</Badge></p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setIsEditing(true)} className="bg-teal-600 hover:bg-teal-700">
          Editar
        </Button>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6 bg-background text-foreground p-4 rounded-md">
      <h3 className="text-xl font-medium">Editar Empresa</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fantasy_name">Nome Fantasia</Label>
          <Input 
            id="fantasy_name" 
            value={editedCompany.fantasy_name || ''}
            onChange={(e) => handleChange('fantasy_name', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cnae">CNAE</Label>
          <Input 
            id="cnae" 
            value={editedCompany.cnae || ''}
            onChange={(e) => handleChange('cnae', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input 
            id="address" 
            value={editedCompany.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employee_count">Quantidade de Funcionários</Label>
          <Input 
            id="employee_count" 
            type="number"
            value={editedCompany.employee_count || ''}
            onChange={(e) => handleChange('employee_count', parseInt(e.target.value) || null)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_name">Nome do Contato</Label>
          <Input 
            id="contact_name" 
            value={editedCompany.contact_name || ''}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Telefone</Label>
          <Input 
            id="contact_phone" 
            value={editedCompany.contact_phone || ''}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_email">E-mail</Label>
          <Input 
            id="contact_email" 
            value={editedCompany.contact_email || ''}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setEditedCompany({...company});
            setIsEditing(false);
          }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company.fantasy_name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="units">Unidades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            {isEditing ? renderEditMode() : renderViewMode()}
          </TabsContent>
          
          <TabsContent value="contacts">
            <CompanyContacts company={company} />
          </TabsContent>
          
          <TabsContent value="units">
            <CompanyUnits company={company} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
