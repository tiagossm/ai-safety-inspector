
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface DeleteChecklistDialogProps {
  checklistId: string;
  checklistTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => Promise<void>;
  isDeleting?: boolean; // Added as optional
}

export function DeleteChecklistDialog({
  checklistId,
  checklistTitle,
  isOpen,
  onOpenChange,
  onDeleted,
  isDeleting = false // Default value
}: DeleteChecklistDialogProps) {
  const [isDeleting1, setIsDeleting1] = useState(false);
  
  // Use the prop if provided, otherwise use state
  const deleteInProgress = isDeleting || isDeleting1;

  const handleDelete = async () => {
    if (!checklistId) return;
    
    setIsDeleting1(true);
    try {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', checklistId);
      
      if (error) {
        throw error;
      }
      
      await onDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting checklist:', error);
    } finally {
      setIsDeleting1(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá excluir permanentemente o checklist <strong>"{checklistTitle}"</strong> e não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteInProgress}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteInProgress}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Excluindo...
              </>
            ) : (
              'Sim, excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
