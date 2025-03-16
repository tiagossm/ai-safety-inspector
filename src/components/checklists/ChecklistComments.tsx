
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistComment } from "@/types/checklist";

interface ChecklistCommentsProps {
  checklistId: string;
  comments: ChecklistComment[];
  onAddComment: (comment: ChecklistComment) => void;
}

export function ChecklistComments({ checklistId, comments, onAddComment }: ChecklistCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const commentData = {
        checklist_id: checklistId,
        user_id: user.id,
        content: newComment,
      };
      
      const { data, error } = await supabase
        .from("checklist_comments")
        .insert(commentData)
        .select("*, users:user_id(name)")
        .single();
        
      if (error) throw error;
      
      // Format to match our interface
      const formattedComment: ChecklistComment = {
        id: data.id,
        checklist_id: data.checklist_id,
        user_id: data.user_id,
        user_name: data.users?.name || user.email || 'Usuário',
        content: data.content,
        created_at: data.created_at,
      };
      
      onAddComment(formattedComment);
      setNewComment("");
      toast.success("Comentário adicionado com sucesso!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(comment.user_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{comment.user_name}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "Pp", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum comentário ainda.</p>
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        )}
        
        <div className="flex gap-2 items-start pt-4 border-t">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user ? getInitials(user.email || 'U') : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <Button 
                size="sm" 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
