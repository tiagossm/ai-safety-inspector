
import { useState, useEffect } from "react";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistForm() {
  const { user } = useAuth();
  const extendedUser = user as AuthUser | null;
  
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    category: "general",
    responsible_id: "",
    company_id: extendedUser?.company_id, // Set company_id from user if available
    due_date: null
  });

  // Update company_id when user changes
  useEffect(() => {
    if (extendedUser?.company_id && !form.company_id) {
      setForm(prevForm => ({
        ...prevForm,
        company_id: extendedUser.company_id
      }));
    }
  }, [extendedUser?.company_id, form.company_id]);

  return {
    form,
    setForm
  };
}
