
// Update the DeleteChecklistDialogProps to include isDeleting
export interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  isDeleting?: boolean; // Added this property
}
