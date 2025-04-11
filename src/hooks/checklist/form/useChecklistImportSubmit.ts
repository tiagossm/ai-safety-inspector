
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export function useChecklistImportSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const importChecklist = async (
    file: File,
    form: NewChecklist
  ): Promise<string | null> => {
    try {
      setIsSubmitting(true);
      
      // Validate inputs
      if (!file) {
        toast.error("Arquivo é obrigatório");
        return null;
      }
      
      if (!form.title?.trim()) {
        toast.error("O título é obrigatório");
        return null;
      }
      
      // Parse Excel or CSV file
      const questions = await parseSpreadsheetFile(file);
      
      if (!questions || questions.length === 0) {
        toast.error("Nenhuma pergunta encontrada no arquivo");
        return null;
      }
      
      // Create checklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: form.title.trim(),
          description: form.description || `Checklist importado do arquivo: ${file.name}`,
          is_template: form.is_template || false,
          status_checklist: form.status_checklist || "ativo",
          category: form.category || "",
          responsible_id: form.responsible_id || null,
          company_id: form.company_id || null,
          status: form.status || "active", 
          origin: "csv" // Explicitly set the origin
        })
        .select("id")
        .single();
      
      if (checklistError) {
        console.error("Error creating checklist:", checklistError);
        toast.error("Erro ao criar checklist");
        return null;
      }
      
      const checklistId = checklistData.id;
      
      // Prepare questions for insertion
      const questionsToInsert = questions.map((q, index) => ({
        checklist_id: checklistId,
        pergunta: q.text.trim(),
        tipo_resposta: q.type || "sim/não",
        obrigatorio: q.required !== undefined ? q.required : true,
        ordem: index,
        permite_foto: q.allowPhoto || false,
        permite_video: q.allowVideo || false,
        permite_audio: q.allowAudio || false,
        opcoes: q.options && q.options.length > 0 ? q.options : null,
        hint: q.hint || null,
        weight: q.weight || 1
      }));
      
      // Insert questions
      const { error: questionsError } = await supabase
        .from("checklist_itens")
        .insert(questionsToInsert);
      
      if (questionsError) {
        console.error("Error adding questions:", questionsError);
        toast.warning("Checklist criado, mas houve um erro ao adicionar algumas perguntas");
      }
      
      // Add to history
      await supabase.from("checklist_history").insert({
        checklist_id: checklistId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action: "create",
        details: `Checklist importado do arquivo ${file.name} com ${questions.length} perguntas`
      });
      
      toast.success("Checklist importado com sucesso!");
      return checklistId;
    } catch (error) {
      console.error("Error in importChecklist:", error);
      toast.error(`Erro ao importar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to parse spreadsheet file
  const parseSpreadsheetFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          // Map the spreadsheet data to our question format
          const questions = json.map((row: any) => {
            // Determine question type based on input
            let type = row.tipo?.toLowerCase() || "sim/não";
            let options: string[] | null = null;
            
            // Normalize question type
            if (type.includes("sim") || type.includes("não") || type.includes("yes") || type.includes("no")) {
              type = "sim/não";
            } else if (type.includes("múltipla") || type.includes("multipla") || type.includes("multiple")) {
              type = "múltipla escolha";
              
              // Extract options if present
              if (row.opcoes) {
                options = Array.isArray(row.opcoes) 
                  ? row.opcoes 
                  : String(row.opcoes).split(",").map(o => o.trim());
              } else {
                options = ["Opção 1", "Opção 2", "Opção 3"];
              }
            } else if (type.includes("texto") || type.includes("text")) {
              type = "texto";
            } else if (type.includes("numérico") || type.includes("numerico") || type.includes("numeric")) {
              type = "numérico";
            }
            
            return {
              text: row.pergunta || row.questao || row.question || row.text || "",
              type,
              required: row.obrigatorio !== undefined ? !!row.obrigatorio : true,
              allowPhoto: !!row.permite_foto,
              allowVideo: !!row.permite_video,
              allowAudio: !!row.permite_audio,
              options,
              hint: row.dica || row.hint || null,
              weight: row.peso || row.weight || 1
            };
          }).filter(q => q.text.trim() !== "");
          
          resolve(questions);
        } catch (error) {
          console.error("Error parsing spreadsheet:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  
  return {
    isSubmitting,
    importChecklist
  };
}
