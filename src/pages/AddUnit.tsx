
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitForm } from "@/components/unit/UnitForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddUnit() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { companyId } = useParams();

  const handleClose = () => {
    navigate(`/companies/${companyId}`);
  };

  const handleSubmit = async (unitData: any) => {
    try {
      // Calcular o dimensionamento da CIPA se houver número de funcionários e CNAE
      let cipaDimensioning = null;
      if (unitData.employee_count !== null && unitData.cnae) {
        const { data: dimensioning } = await supabase.rpc('get_cipa_dimensioning', {
          p_employee_count: unitData.employee_count,
          p_cnae: unitData.cnae,
          p_risk_level: parseInt(unitData.metadata?.risk_grade || '1')
        });
        cipaDimensioning = dimensioning;
      }

      const { error } = await supabase
        .from('units')
        .insert([{
          ...unitData,
          company_id: companyId,
          cipa_dimensioning: cipaDimensioning
        }]);

      if (error) throw error;

      toast({
        title: "Unidade adicionada",
        description: "A unidade foi adicionada com sucesso."
      });

      navigate(`/companies/${companyId}`);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar unidade",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Adicionar Nova Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <UnitForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
