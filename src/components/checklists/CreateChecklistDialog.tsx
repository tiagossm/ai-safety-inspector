
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export function CreateChecklistDialog() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCreateChecklist = () => {
    try {
      setIsLoading(true);
      console.log("Creating new checklist, navigating to /checklists/create");
      navigate("/checklists/create");
    } catch (error) {
      console.error("Error navigating to create checklist:", error);
      toast.error("Falha ao criar novo checklist", {
        description: "Ocorreu um erro ao tentar criar um novo checklist. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleCreateChecklist} 
      className="whitespace-nowrap"
      disabled={isLoading}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      {isLoading ? "Carregando..." : "Novo Checklist"}
    </Button>
  );
}
