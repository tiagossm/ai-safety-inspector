
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  SaveAll, 
  CheckCircle, 
  Settings, 
  Trash, 
  Share2, 
  MoreVertical,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingActionMenuProps {
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onReopenInspection: () => Promise<void>;
  onEditData: () => void;
  onShare: () => void;
  onDelete: () => void;
  isEditable: boolean;
  isSaving: boolean;
  isCompleted: boolean;
}

export function FloatingActionMenu({
  onSaveProgress,
  onCompleteInspection,
  onReopenInspection,
  onEditData,
  onShare,
  onDelete,
  isEditable,
  isSaving,
  isCompleted
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleAction = (action: () => void | Promise<void>) => {
    action();
    setIsOpen(false);
  };
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="flex flex-col-reverse gap-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Save progress button */}
            {isEditable && !isCompleted && (
              <Button 
                variant="default" 
                size="icon" 
                className="shadow-lg bg-primary hover:bg-primary/90"
                onClick={() => handleAction(onSaveProgress)}
                disabled={isSaving}
              >
                <SaveAll size={20} />
              </Button>
            )}
            
            {/* Complete or reopen inspection button */}
            {isEditable ? (
              !isCompleted ? (
                <Button 
                  variant="default" 
                  size="icon" 
                  className="shadow-lg bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(onCompleteInspection)}
                  disabled={isSaving}
                >
                  <CheckCircle size={20} />
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="icon" 
                  className="shadow-lg bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleAction(onReopenInspection)}
                  disabled={isSaving}
                >
                  <CheckCircle size={20} />
                </Button>
              )
            ) : null}
            
            {/* Edit data button */}
            <Button 
              variant="default" 
              size="icon" 
              className="shadow-lg bg-blue-600 hover:bg-blue-700"
              onClick={() => handleAction(onEditData)}
            >
              <Settings size={20} />
            </Button>
            
            {/* Share button */}
            <Button 
              variant="default" 
              size="icon" 
              className="shadow-lg bg-purple-600 hover:bg-purple-700"
              onClick={() => handleAction(onShare)}
            >
              <Share2 size={20} />
            </Button>
            
            {/* Delete button */}
            {isEditable && (
              <Button 
                variant="default" 
                size="icon" 
                className="shadow-lg bg-red-600 hover:bg-red-700"
                onClick={() => handleAction(onDelete)}
              >
                <Trash size={20} />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main toggle button */}
      <Button
        variant="default"
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <MoreVertical size={24} />}
      </Button>
    </div>
  );
}
