import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function CreateChecklist() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new route 
    navigate("/checklists/new");
  }, [navigate]);

  return null;
}
