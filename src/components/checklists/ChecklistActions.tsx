
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
  Share2,
  Edit,
  Download,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateChecklistPDF } from "@/utils/pdfGenerator";

interface ChecklistActionsProps {
  checklist: Checklist;
  onRefresh?: () => void;
  currentPage?: 'detail' | 'edit';
}

export function ChecklistActions({ 
  checklist, 
  onRefresh, 
  currentPage = 'detail' 
}: ChecklistActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [includeResponses, setIncludeResponses] = useState(true);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Here you would implement the save logic
      const { error } = await supabase
        .from('checklists')
        .update({
          title: checklist.title,
          description: checklist.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      toast.success("Checklist salvo com sucesso!");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast.error("Erro ao salvar checklist");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    
    try {
      setIsDeleting(true);
      
      // First, delete all related items
      const { error: itemsError } = await supabase
        .from('checklist_itens')
        .delete()
        .eq('checklist_id', checklist.id);
        
      if (itemsError) {
        console.error("Error deleting checklist items:", itemsError);
        throw itemsError;
      }
      
      // Then delete the checklist
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      toast.success("Checklist excluído com sucesso!");
      navigate('/checklists');
    } catch (error) {
      console.error("Error deleting checklist:", error);
      toast.error("Erro ao excluir checklist");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      toast.info("Duplicando checklist...");
      
      // Get all items from the current checklist
      const { data: items, error: itemsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklist.id);
        
      if (itemsError) throw itemsError;

      // Create a new checklist as a copy
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

      // Copy all items to the new checklist
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
          permite_foto: item.permite_foto,
          hint: item.hint,
          weight: item.weight
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
      const result = await generateChecklistPDF(checklist);
      if (result) {
        toast.success("PDF exportado com sucesso!");
      }
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
    if (!emailAddress.trim() || !/\S+@\S+\.\S+/.test(emailAddress)) {
      toast.error("Email inválido");
      return;
    }
    
    setShowEmailDialog(false);
    setIsSendingEmail(true);
    
    try {
      // Here you would implement email sending logic
      // This is a mock implementation
      toast.success(`Checklist enviado para ${emailAddress}`);
      
      // Record the action in history
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('checklist_history').insert({
            checklist_id: checklist.id,
            user_id: userData.user.id,
            action: 'share',
            details: `Enviado por email para ${emailAddress}`
          });
        }
      } catch (error) {
        console.error("Error recording email history:", error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erro ao enviar email");
    } finally {
      setIsSendingEmail(false);
      setEmailAddress("");
    }
  };
  
  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };
  
  const handleEdit = () => {
    navigate(`/checklists/${checklist.id}/edit`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {currentPage === 'detail' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEdit}
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      )}
      
      {currentPage === 'edit' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave} 
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      )}
      
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
        onClick={() => setShowEmailDialog(true)}
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
        onClick={() => setShowDeleteDialog(true)}
        disabled={isDeleting}
      >
        <Trash className="h-4 w-4 mr-1" />
        {isDeleting ? "Excluindo..." : "Excluir"}
      </Button>
      
      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Checklist por Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                placeholder="exemplo@email.com" 
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeResponses" 
                checked={includeResponses}
                onCheckedChange={(checked) => 
                  setIncludeResponses(checked as boolean)
                }
              />
              <label 
                htmlFor="includeResponses" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incluir respostas
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleSendEmail}
              disabled={!emailAddress.trim() || !/\S+@\S+\.\S+/.test(emailAddress)}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
