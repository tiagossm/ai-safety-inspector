
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklist } from "@/types/checklist";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useManualSubmit() {
  const createChecklist = useCreateChecklist();
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
      
      const newChecklist = await createChecklist.mutateAsync(form);
      
      if (!newChecklist?.id) {
        console.error("No checklist ID was returned");
        throw new Error("Erro ao criar checklist: ID não foi gerado");
      }
      
      if (questions.length > 0) {
        console.log(`Adding ${questions.length} questions to checklist ${newChecklist.id}`);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.error("No active session for questions insertion");
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        
        const promises = questions.map((q, i) => {
          if (q.text.trim()) {
            return supabase
              .from("checklist_itens")
              .insert({
                checklist_id: newChecklist.id,
                pergunta: q.text,
                tipo_resposta: q.type,
                obrigatorio: q.required,
                ordem: i,
                permite_audio: q.allowAudio || false,
                permite_video: q.allowVideo || false,
                permite_foto: q.allowPhoto || false
              });
          }
          return Promise.resolve(null);
        });
        
        const results = await Promise.all(promises.filter(Boolean));
        console.log("Questions insertion results:", results);
      }
      
      toast.success("Checklist criado com sucesso!");
      
      navigate(`/checklists/${newChecklist.id}`);
      
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
