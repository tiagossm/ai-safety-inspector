
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ChecklistNotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <h2 className="text-2xl font-bold text-gray-700">Checklist não encontrado</h2>
      <p className="text-gray-500 mt-2">O checklist solicitado não existe ou foi removido.</p>
      <Button className="mt-6" onClick={() => navigate('/checklists')}>
        Voltar para Checklists
      </Button>
    </div>
  );
}
