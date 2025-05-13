
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface CommentsSectionProps {
  comment: string;
  onCommentChange: (comment: string) => void;
}

export function CommentsSection({ comment, onCommentChange }: CommentsSectionProps) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Comentários
      </label>
      <Textarea
        placeholder="Adicione comentários sobre esta pergunta..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="w-full p-2 text-sm"
        rows={3}
      />
    </div>
  );
}
