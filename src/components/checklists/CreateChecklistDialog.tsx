
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function CreateChecklistDialog() {
  const navigate = useNavigate();
  
  const handleCreateChecklist = () => {
    try {
      console.log("Creating new checklist, navigating to /checklists/create");
      navigate("/checklists/create");
    } catch (error) {
      console.error("Error navigating to create checklist:", error);
      toast.error("Falha ao criar novo checklist");
    }
  };
  
  return (
    <Button onClick={handleCreateChecklist} className="whitespace-nowrap">
      <PlusCircle className="mr-2 h-4 w-4" />
      Novo Checklist
    </Button>
  );
}
