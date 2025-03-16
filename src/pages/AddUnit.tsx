
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
      console.log("Submitting unit data:", unitData);
      
      // Calcular o dimensionamento da CIPA se houver número de funcionários e CNAE
      let cipaDimensioning = null;
      if (unitData.employee_count !== null && unitData.cnae) {
        const riskGrade = parseInt(unitData.metadata?.risk_grade || '1');
        console.log("Calculating CIPA dimensioning with:", {
          employeeCount: unitData.employee_count,
          cnae: unitData.cnae,
          riskLevel: riskGrade
        });
        
        const { data: dimensioning, error } = await supabase.rpc('get_cipa_dimensioning', {
          p_employee_count: unitData.employee_count,
          p_cnae: unitData.cnae.replace(/[^\d]/g, ''),
          p_risk_level: riskGrade
        });
        
        if (error) {
          console.error("Error calculating CIPA dimensioning:", error);
        }
        
        // Verificar se os dados retornados são válidos
        if (dimensioning && typeof dimensioning === 'object' && 'norma' in dimensioning) {
          console.log("CIPA dimensioning result:", dimensioning);
          cipaDimensioning = dimensioning;
        } else if (unitData.employee_count < 20 && riskGrade === 4) {
          cipaDimensioning = { message: 'Designar 1 representante da CIPA', norma: 'NR-5' };
        }
      }

      const finalData = {
        ...unitData,
        company_id: companyId,
        cipa_dimensioning: cipaDimensioning,
        metadata: {
          ...unitData.metadata,
          risk_grade: unitData.metadata?.risk_grade || '1'
        }
      };
      
      console.log("Saving unit with data:", finalData);

      const { error } = await supabase
        .from('units')
        .insert([finalData]);

      if (error) {
        console.error("Error inserting unit:", error);
        throw error;
      }

      toast({
        title: "Unidade adicionada",
        description: "A unidade foi adicionada com sucesso."
      });

      navigate(`/companies/${companyId}`);
    } catch (error: any) {
      console.error("Error submitting unit:", error);
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
