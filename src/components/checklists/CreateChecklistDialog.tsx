
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CreateChecklistDialog() {
  const navigate = useNavigate();
  
  const handleCreateChecklist = () => {
    console.log("Creating new checklist, navigating to /checklists/new");
    navigate("/checklists/new");
  };
  
  return (
    <Button onClick={handleCreateChecklist} className="whitespace-nowrap">
      <PlusCircle className="mr-2 h-4 w-4" />
      Novo Checklist
    </Button>
  );
}
