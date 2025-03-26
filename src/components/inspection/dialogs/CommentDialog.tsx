
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  onSave,
}: CommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1">Pergunta:</Label>
            <p className="text-sm">{questionText}</p>
          </div>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Adicione seu comentário aqui..."
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={onSave}>
              Salvar Comentário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
