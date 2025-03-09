
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ChecklistNotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Checklist não encontrado</h2>
      <p className="text-muted-foreground mb-6">
        O checklist solicitado não existe ou você não tem permissão para acessá-lo.
      </p>
      <Button 
        className="bg-primary text-white px-4 py-2 rounded"
        onClick={() => navigate("/checklists")}
      >
        Voltar para Checklists
      </Button>
    </div>
  );
}
