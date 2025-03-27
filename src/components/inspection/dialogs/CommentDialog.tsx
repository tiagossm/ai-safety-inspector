
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionText: string;
  commentText: string;
  setCommentText: (text: string) => void;
  onSave: () => void;
}

export function CommentDialog({
  open,
  onOpenChange,
  questionText,
  commentText,
  setCommentText,
  onSave
}: CommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md" 
        aria-describedby="comment-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
          <DialogDescription id="comment-dialog-description">
            Adicione informações adicionais para esta pergunta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="bg-muted/50 p-2 rounded text-sm">
            <p className="font-medium mb-1 text-xs text-muted-foreground">Pergunta:</p>
            <p>{questionText}</p>
          </div>
          
          <Textarea
            placeholder="Digite seu comentário aqui..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={5}
            aria-describedby="comment-dialog-description"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>Salvar Comentário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
