
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUploaded: (mediaUrls: string[]) => void;
  response?: any;
  allowedTypes?: string[];
}

export function MediaDialog({
  open,
  onOpenChange,
  onMediaUploaded,
  response,
  allowedTypes = ["image/*", "video/*", "audio/*"]
}: MediaDialogProps) {
  const handleMediaUpload = () => {
    // Simulating media upload and returning array of URLs
    const newMediaUrls = ["https://example.com/sample-upload.jpg"];
    onMediaUploaded(newMediaUrls);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Mídia</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleMediaUpload}
          >
            Simular Upload
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
