
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, File, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistAttachment } from "@/types/checklist";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChecklistAttachmentsProps {
  checklistId: string;
  attachments: ChecklistAttachment[];
  onAddAttachment: (attachment: ChecklistAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export function ChecklistAttachments({ 
  checklistId, 
  attachments, 
  onAddAttachment, 
  onRemoveAttachment 
}: ChecklistAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${checklistId}/${fileName}`;
    
    setIsUploading(true);
    
    try {
      // Get user's name from the users table first
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();
        
      if (userError) {
        console.error("Error fetching user data:", userError);
      }
      
      const userName = userData?.name || user.email || 'Usuário';
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('checklist-attachments')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('checklist-attachments')
        .getPublicUrl(filePath);
      
      // Save attachment record
      const attachmentData = {
        checklist_id: checklistId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        uploaded_by: user.id
      };
      
      const { data, error } = await supabase
        .from('checklist_attachments')
        .insert(attachmentData)
        .select()
        .single();
      
      if (error) throw error;
      
      const formattedAttachment: ChecklistAttachment = {
        id: data.id,
        checklist_id: data.checklist_id,
        file_name: data.file_name,
        file_url: data.file_url,
        file_type: data.file_type,
        uploaded_by: userName,
        created_at: data.created_at
      };
      
      onAddAttachment(formattedAttachment);
      
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };
  
  const handleRemoveAttachment = async (attachmentId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/checklist-attachments\/(.+)/);
      const filePath = filePathMatch ? filePathMatch[1] : null;
      
      // Remove from database
      const { error: dbError } = await supabase
        .from('checklist_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (dbError) throw dbError;
      
      // Remove from storage if path was extracted
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('checklist-attachments')
          .remove([filePath]);
          
        if (storageError) console.warn("Could not remove file from storage:", storageError);
      }
      
      onRemoveAttachment(attachmentId);
      toast.success("Arquivo removido com sucesso!");
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast.error("Erro ao remover arquivo");
    }
  };
  
  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📁';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Arrastar e soltar ou</p>
            <Button 
              variant="link" 
              className="mt-1"
              disabled={isUploading}
            >
              {isUploading ? 'Enviando...' : 'Escolher arquivo'}
            </Button>
          </label>
        </div>
        
        {attachments.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto p-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFileIcon(attachment.file_type)}</div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(attachment.created_at), "Pp", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleRemoveAttachment(attachment.id, attachment.file_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum anexo.</p>
            <p className="text-sm">Adicione arquivos ao checklist.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
