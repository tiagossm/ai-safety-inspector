
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  isCommentOpen: boolean;
  setIsCommentOpen: (isOpen: boolean) => void;
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
    <div className="w-full">
      {isCommentOpen ? (
        <div className="space-y-2">
          <label 
            htmlFor="comment" 
            className="flex items-center text-sm font-medium text-gray-700"
          >
            <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
            Comment
          </label>
          <textarea
            id="comment"
            className="w-full border rounded p-2 text-sm"
            placeholder="Add a comment..."
            value={comment}
            onChange={handleCommentChange}
            rows={2}
          />
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCommentOpen(false)}
            >
              Hide
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCommentOpen(true)} 
          className="flex items-center text-gray-500"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {comment ? "Edit comment" : "Add comment"}
        </Button>
      )}
    </div>
  );
}
