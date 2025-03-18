
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useManualSubmit() {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const typedUser = user as AuthUser | null;

  const submitManualChecklist = async (
    form: NewChecklist, 
    questions: Array<{ 
      text: string; 
      type: string; 
      required: boolean;
      allowPhoto?: boolean;
      allowVideo?: boolean;
      allowAudio?: boolean;
      options?: string[];
      hint?: string;
      weight?: number;
      parentId?: string;
      conditionValue?: string;
    }>
  ) => {
    try {
      console.log("Submitting manual form:", form);
      
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
        console.log("Added user_id to form:", form.user_id);
      }
      
      console.log("User tier:", typedUser?.tier);
      console.log("User role:", typedUser?.role);
      
      console.log("Form validation - has title:", !!form.title);
      console.log("Questions count:", questions.length);
      
      await refreshSession();

      // Handle 'none' values for company_id and responsible_id
      const processedForm = { 
        ...form,
        company_id: form.company_id === "none" ? null : form.company_id,
        responsible_id: form.responsible_id === "none" ? null : form.responsible_id
      };
      
      // Instead of creating the checklist immediately, store the data for the editor
      const editorData = {
        checklistData: processedForm,
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          required: q.required,
          allowPhoto: q.allowPhoto || false,
          allowVideo: q.allowVideo || false,
          allowAudio: q.allowAudio || false,
          options: q.options || [],
          hint: q.hint || '',
          weight: q.weight || 1,
          parentId: q.parentId || null,
          conditionValue: q.conditionValue || null
        })),
        mode: "create"
      };
      
      // Store the data in sessionStorage
      sessionStorage.setItem('checklistEditorData', JSON.stringify(editorData));
      
      // Redirect to editor
      navigate('/checklists/editor');
      
      return true;
    } catch (error) {
      console.error("Error in manual submission:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    }
  };

  return {
    submitManualChecklist
  };
}
