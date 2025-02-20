
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitForm } from "@/components/unit/UnitForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";

export default function AddUnit() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { companyId } = useParams();

  const handleSubmit = async (unitData: any) => {
    try {
      const { error } = await supabase
        .from('units')
        .insert([{
          ...unitData,
          company_id: companyId
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
        <CardHeader>
          <CardTitle>Adicionar Nova Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <UnitForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
