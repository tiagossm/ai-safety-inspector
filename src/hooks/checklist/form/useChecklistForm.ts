
import { useState } from "react";
import { NewChecklist } from "@/types/checklist";

export function useChecklistForm() {
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    category: "general",
    responsible_id: "",
    company_id: undefined,
    due_date: null
  });

  return {
    form,
    setForm
  };
}
