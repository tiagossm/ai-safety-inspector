
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChecklistById } from "@/hooks/checklist/useChecklistById";
import { Loader2 } from "lucide-react";

export default function ChecklistRedirectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading, error } = useChecklistById(id || "");

  useEffect(() => {
    if (!isLoading) {
      if (checklist) {
        // Redirect to the new inspection page with checklist ID
        navigate(`/inspections/new/${id}`);
      } else {
        // If no checklist found, go back to list
        navigate("/checklists");
      }
    }
  }, [checklist, isLoading, navigate, id]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="mt-4 text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
