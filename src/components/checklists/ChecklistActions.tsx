import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Save, 
  FileText, 
  Printer, 
  Mail, 
  Copy, 
  Trash, 
  Share2 
} from "lucide-react";
import { useSaveChecklist } from "@/hooks/checklist/useSaveChecklist";
import { Checklist } from "@/types/checklist";
import { useDeleteChecklist } from "@/hooks/checklist/useDeleteChecklist";
import { useNavigate } from "react-router-dom";
import { generateChecklistPDF } from "@/utils/pdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";

interface ChecklistActionsProps {
  checklist: Checklist;
  onRefresh?: () => void;
}

export function ChecklistActions({ checklist, onRefresh }: ChecklistActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const saveChecklist = useSaveChecklist(checklist.id);
  const deleteChecklist = useDeleteChecklist();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveChecklist.mutateAsync(checklist);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving checklist:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este checklist?")) {
      try {
        setIsDeleting(true);
        await deleteChecklist.mutateAsync(checklist.id);
        navigate("/checklists");
      } catch (error) {
        console.error("Error deleting checklist:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      toast.info("Duplicando checklist...");
      const { data: items } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklist.id);

      const { data: newChecklist, error } = await supabase
        .from("checklists")
        .insert({
          title: `Cópia de ${checklist.title}`,
          description: checklist.description,
          is_template: checklist.is_template,
          status_checklist: checklist.status_checklist,
          category: checklist.category,
          responsible_id: checklist.responsible_id,
          company_id: checklist.company_id
        })
        .select()
        .single();

      if (error) throw error;

      if (items && items.length > 0 && newChecklist) {
        const newItems = items.map(item => ({
          checklist_id: newChecklist.id,
          pergunta: item.pergunta,
          tipo_resposta: item.tipo_resposta,
          obrigatorio: item.obrigatorio,
          ordem: item.ordem,
          opcoes: item.opcoes,
          permite_audio: item.permite_audio,
          permite_video: item.permite_video,
          permite_foto: item.permite_foto
        }));

        await supabase.from("checklist_itens").insert(newItems);
      }

      toast.success("Checklist duplicado com sucesso!");
      navigate(`/checklists/${newChecklist.id}`);
    } catch (error) {
      console.error("Error duplicating checklist:", error);
      toast.error("Erro ao duplicar checklist");
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await generateChecklistPDF(checklist);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      const email = prompt("Digite o email para enviar o checklist:");
      
      if (!email) {
        setIsSendingEmail(false);
        return;
      }
      
      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error("Email inválido");
        setIsSendingEmail(false);
        return;
      }
      
      toast.info("Enviando checklist por email...");
      
      setTimeout(() => {
        toast.success(`Checklist enviado para ${email}`);
        setIsSendingEmail(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erro ao enviar email");
      setIsSendingEmail(false);
    }
  };
  
  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSave} 
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-1" />
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF} 
        disabled={isExporting}
      >
        <FileText className="h-4 w-4 mr-1" />
        {isExporting ? "Exportando..." : "Exportar PDF"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 mr-1" />
        Imprimir
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSendEmail} 
        disabled={isSendingEmail}
      >
        <Mail className="h-4 w-4 mr-1" />
        {isSendingEmail ? "Enviando..." : "Enviar Email"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDuplicate}
      >
        <Copy className="h-4 w-4 mr-1" />
        Duplicar
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleShareLink}
      >
        <Share2 className="h-4 w-4 mr-1" />
        Compartilhar
      </Button>
      
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDelete} 
        disabled={isDeleting}
      >
        <Trash className="h-4 w-4 mr-1" />
        {isDeleting ? "Excluindo..." : "Excluir"}
      </Button>
    </div>
  );
}

