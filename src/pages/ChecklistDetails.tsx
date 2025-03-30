import { useParams, useNavigate } from "react-router-dom";
import ChecklistDetailsContainer from "@/components/checklists/ChecklistDetailsContainer";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id) {
      console.error("ChecklistDetails: Missing checklist ID in URL parameters");
      toast.error("ID do checklist não fornecido", {
        description: "Não foi possível carregar o checklist pois o ID não foi encontrado na URL",
        duration: 5000
      });
      
      // Adding a small delay to ensure the user sees the message
      setTimeout(() => {
        navigate("/checklists");
      }, 1000);
    }
  }, [id, navigate]);

  // If no ID is provided, show a helpful error message instead of a blank page
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <div className="space-y-6 text-center max-w-md">
          <h2 className="text-2xl font-bold">Checklist não encontrado</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar o checklist porque o ID não foi fornecido na URL.
            Isso pode acontecer devido a um erro de navegação ou porque o checklist não foi criado corretamente.
          </p>
          <Button 
            variant="default" 
            onClick={() => navigate("/checklists")}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Checklists
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <ChecklistDetailsContainer checklistId={id} />
    </>
  );
}
