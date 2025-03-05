
import { useParams, useNavigate } from "react-router-dom";
import ChecklistDetailsContainer from "@/components/checklists/ChecklistDetailsContainer";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ChecklistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id) {
      toast.error("ID do checklist não fornecido");
      navigate("/checklists");
    }
  }, [id, navigate]);

  if (!id) return null;
  
  return <ChecklistDetailsContainer checklistId={id} />;
}
