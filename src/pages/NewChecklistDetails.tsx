
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { ChecklistWithStats } from "@/types/newChecklist";

const NewChecklistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checklist, loading, error } = useChecklistById(id || "");
  
  useEffect(() => {
    if (error) {
      console.error("Error loading checklist:", error);
    }
  }, [error]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error || !checklist) {
    return <div>Error loading checklist details</div>;
  }

  return (
    <div>
      <h1>{checklist.title}</h1>
      <p>{checklist.description}</p>
    </div>
  );
};

export default NewChecklistDetails;
