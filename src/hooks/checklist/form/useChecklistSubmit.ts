import { useState, useEffect } from "react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistAI } from "./useChecklistAI";
import { useChecklistImport } from "./useChecklistImport";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface ImportResult {
  id?: string;
  checklist_id?: string;
  success?: boolean;
  questions_added?: number;
}

interface AIResult {
  id?: string;
  data?: {
    checklist_id?: string;
  };
  success?: boolean;
}

export function useChecklistSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const createChecklist = useCreateChecklist();
  const { generateAIChecklist } = useChecklistAI();
  const { importFromFile } = useChecklistImport();
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const typedUser = user as AuthUser | null;

  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshSession();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("Session verified in useChecklistSubmit");
          setSessionChecked(true);
        } else {
          console.error("No valid session found in useChecklistSubmit");
          toast.error("Sua sessão expirou. Faça login novamente.");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, [refreshSession, navigate]);

  const submitManualChecklist = async (
    form: NewChecklist, 
    questions: Array<{ text: string; type: string; required: boolean }>
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
                permite_audio: true,
                permite_video: true,
                permite_foto: true
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

  const handleSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: Array<{ text: string; type: string; required: boolean }>,
    file: File | null,
    aiPrompt: string
  ) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate submit");
      return false;
    }
    
    if (activeTab === "manual" && !form.title.trim()) {
      toast.error("O título é obrigatório");
      return false;
    } else if (activeTab === "import" && !file) {
      toast.error("Por favor, selecione um arquivo para importar");
      return false;
    } else if (activeTab === "ai" && !aiPrompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return false;
    }
    
    console.log(`Starting checklist creation via ${activeTab} tab`);
    setIsSubmitting(true);
    
    try {
      await refreshSession();
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session found");
        toast.error("Você precisa estar autenticado para criar um checklist");
        setIsSubmitting(false);
        navigate("/auth");
        return false;
      }
      
      console.log(`Processing submission for ${activeTab} tab with user:`, typedUser?.id);
      console.log("Current session valid:", !!sessionData.session);
      
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
        console.log("Added user_id to form:", form.user_id);
      }
      
      let success = false;
      let checklistId: string | null = null;
      
      if (activeTab === "manual") {
        success = await submitManualChecklist(form, questions);
        return success;
      } 
      else if (activeTab === "import" && file) {
        console.log("Processing file import");
        console.log("File details:", file.name, file.type, `${Math.round(file.size / 1024)} KB`);
        
        const importResult = await importFromFile(file, form) as any;
        
        if (importResult && typeof importResult === 'object') {
          success = importResult.success || true;
          
          if ('id' in importResult) {
            checklistId = importResult.id;
          } else if ('checklist_id' in importResult) {
            checklistId = importResult.checklist_id;
          }
          
          console.log("Import successful, checklist ID:", checklistId);
        } else {
          success = false;
          console.error("Import failed or returned invalid result", importResult);
          toast.error("Falha ao importar checklist. Verifique o arquivo e tente novamente.");
        }
      } 
      else if (activeTab === "ai") {
        console.log("Processing AI generation");
        console.log("AI Prompt:", aiPrompt);
        
        const aiResult = await generateAIChecklist(form) as AIResult;
        
        if (aiResult && typeof aiResult === 'object') {
          success = true;
          
          if ('id' in aiResult) {
            checklistId = aiResult.id;
          } else if ('data' in aiResult) {
            const resultData = aiResult.data;
            if (resultData && 'checklist_id' in resultData) {
              checklistId = resultData.checklist_id;
            }
          }
          
          if (!checklistId) {
            console.error("AI generation succeeded but no checklist ID was found in the response", aiResult);
          } else {
            console.log("AI generation successful, checklist ID:", checklistId);
          }
        } else {
          success = false;
          console.error("AI generation failed or returned invalid result", aiResult);
          toast.error("Falha ao gerar checklist com IA. Tente novamente.");
        }
      }
      
      if (success) {
        toast.success("Checklist criado com sucesso!");
        
        if (checklistId && activeTab !== "manual") {
          console.log(`Redirecting to checklist details: /checklists/${checklistId}`);
          navigate(`/checklists/${checklistId}`);
        } else if (!checklistId && activeTab !== "manual" && success) {
          console.log("Success but no ID returned, redirecting to main checklists page");
          navigate('/checklists');
          toast.info("Checklist criado, mas não foi possível abrir automaticamente.");
        }
        
        return true;
      } else {
        if (activeTab !== "manual") {
          toast.error("Erro ao criar checklist. Verifique os dados e tente novamente.");
        }
        return false;
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      let errorMessage = "Erro ao criar checklist.";
      
      if (error instanceof Error) {
        if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('auth')) {
          errorMessage += " Problema de autenticação. Tente fazer login novamente.";
          navigate("/auth");
        } else {
          errorMessage += ` ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    sessionChecked
  };
}

