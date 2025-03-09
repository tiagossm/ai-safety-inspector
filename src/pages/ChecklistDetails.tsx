
import { useParams, useNavigate } from "react-router-dom";
import ChecklistDetailsContainer from "@/components/checklists/ChecklistDetailsContainer";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id) {
      console.error("ChecklistDetails: Missing checklist ID in URL parameters");
      toast.error("ID do checklist não fornecido", {
        description: "Não foi possível carregar o checklist pois o ID não foi encontrado",
        duration: 3000
      });
      
      // Adding a small delay to ensure the user sees the message
      setTimeout(() => {
        navigate("/checklists");
      }, 500);
    }
  }, [id, navigate]);

  // Return null immediately if there's no ID, don't render the container
  if (!id) return null;
  
  return <ChecklistDetailsContainer checklistId={id} />;
}
