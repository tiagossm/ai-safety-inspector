
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  CheckCircle, 
  RefreshCw, 
  Share2, 
  Trash, 
  Edit, 
  MoreVertical, 
  X,
  FileText,
  ListTodo
} from "lucide-react";

interface FloatingActionMenuProps {
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onEditData: () => void;
  onShare: () => void;
  onDelete: () => void;
  isEditable: boolean;
  isSaving: boolean;
  isCompleted: boolean;
  onReopenInspection: () => Promise<void>;
}

export function FloatingActionMenu({
  onSaveProgress,
  onCompleteInspection,
  onEditData,
  onShare,
  onDelete,
  isEditable,
  isSaving,
  isCompleted,
  onReopenInspection
}: FloatingActionMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {menuOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2">
          {isEditable && (
            <>
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-lg"
                onClick={onSaveProgress}
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-lg bg-green-600 hover:bg-green-700"
                onClick={onCompleteInspection}
                disabled={isSaving}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
                onClick={onEditData}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {isCompleted && (
            <>
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-lg bg-amber-600 hover:bg-amber-700"
                onClick={onReopenInspection}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700"
                onClick={() => alert("Funcionalidade em desenvolvimento: Plano de Ação")}
              >
                <ListTodo className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="default"
                className="rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
                onClick={() => alert("Funcionalidade em desenvolvimento: Relatório")}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            size="icon"
            variant="default"
            className="rounded-full shadow-lg"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            variant="destructive"
            className="rounded-full shadow-lg"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Button
        size="icon"
        variant={menuOpen ? "secondary" : "default"}
        className="rounded-full h-12 w-12 shadow-lg"
        onClick={toggleMenu}
      >
        {menuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MoreVertical className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
