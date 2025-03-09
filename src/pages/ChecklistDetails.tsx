
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
      // Adicionando um pequeno atraso para garantir que o usuário veja a mensagem
      setTimeout(() => {
        navigate("/checklists");
      }, 300);
    }
  }, [id, navigate]);

  // Retorne null imediatamente se não houver ID, não renderize o container
  if (!id) return null;
  
  return <ChecklistDetailsContainer checklistId={id} />;
}
