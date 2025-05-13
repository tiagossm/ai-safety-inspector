
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CommentsSectionProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  readOnly?: boolean;
}

export function CommentsSection({ comment, onCommentChange, readOnly = false }: CommentsSectionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCommentChange(e.target.value);
  };

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center mb-2">
        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
        <h4 className="text-sm font-medium">Comentários</h4>
      </div>
      
      <textarea
        className="w-full border rounded p-2 text-sm mt-2"
        rows={3}
        placeholder="Adicione comentários relevantes aqui..."
        value={comment}
        onChange={handleChange}
        disabled={readOnly}
      />
    </div>
  );
}
