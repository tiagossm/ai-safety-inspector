
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CreateChecklistDialog() {
  const navigate = useNavigate();
  
  return (
    <Button onClick={() => navigate("/checklists/new")}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Novo Checklist
    </Button>
  );
}
