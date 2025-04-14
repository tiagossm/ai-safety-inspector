
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

interface CommentSectionProps {
  isCommentOpen: boolean;
  setIsCommentOpen: (open: boolean) => void;
  comment: string;
  handleCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function CommentSection({ 
  isCommentOpen, 
  setIsCommentOpen, 
  comment, 
  handleCommentChange 
}: CommentSectionProps) {
  return (
    <Collapsible open={isCommentOpen} onOpenChange={setIsCommentOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center text-xs gap-1">
          <Pencil className="h-3 w-3" />
          Adicionar comentário
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2">
          <Textarea
            placeholder="Adicione seus comentários aqui..."
            value={comment}
            onChange={handleCommentChange}
            className="text-sm"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
