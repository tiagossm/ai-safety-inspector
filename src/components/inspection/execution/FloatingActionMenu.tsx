
import React, { useState } from "react";
import { 
  Save, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Share2, 
  RefreshCw, 
  X, 
  MoreVertical,
  FileEdit
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FloatingActionMenuProps {
  onSaveProgress: () => Promise<void>;
  onCompleteInspection?: () => Promise<void>;
  onEditData?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isEditable: boolean;
  isSaving: boolean;
  isCompleted: boolean;
  onReopenInspection?: () => Promise<void>;
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      console.error("Error executing action:", error);
      toast.error("Erro ao executar ação. Tente novamente.");
    } finally {
      setIsExpanded(false);
    }
  };
  
  // For mobile, show a dropdown menu
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <MoreVertical className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isEditable && !isCompleted && (
              <>
                <DropdownMenuItem
                  onClick={() => onSaveProgress()}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Progresso
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onCompleteInspection && onCompleteInspection()}
                  disabled={isSaving}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalizar Inspeção
                </DropdownMenuItem>
              </>
            )}
            
            {isCompleted && onReopenInspection && (
              <DropdownMenuItem
                onClick={() => onReopenInspection()}
                disabled={isSaving}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reabrir Inspeção
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem
              onClick={() => onEditData && onEditData()}
              disabled={isSaving}
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Editar Dados
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onShare && onShare()}
              disabled={isSaving}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onDelete && onDelete()}
              disabled={isSaving}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // For desktop, show the speed dial style menu
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {isExpanded && (
        <>
          {isEditable && !isCompleted && (
            <>
              <Button
                className="flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                onClick={() => handleAction(onSaveProgress)}
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                <span>Salvar Progresso</span>
              </Button>
              
              {onCompleteInspection && (
                <Button
                  variant="default"
                  className="flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
                  onClick={() => onCompleteInspection()}
                  disabled={isSaving}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Finalizar Inspeção</span>
                </Button>
              )}
            </>
          )}
          
          {isCompleted && onReopenInspection && (
            <Button
              variant="outline"
              className="flex items-center gap-2 shadow-md bg-white transition-transform transform hover:scale-105"
              onClick={() => onReopenInspection()}
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reabrir Inspeção</span>
            </Button>
          )}
          
          {onEditData && (
            <Button
              variant="outline"
              className="flex items-center gap-2 shadow-md bg-white transition-transform transform hover:scale-105"
              onClick={() => {
                onEditData();
                setIsExpanded(false);
              }}
              disabled={isSaving}
            >
              <FileEdit className="h-4 w-4" />
              <span>Editar Dados</span>
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="outline"
              className="flex items-center gap-2 shadow-md bg-white transition-transform transform hover:scale-105"
              onClick={() => {
                onShare();
                setIsExpanded(false);
              }}
              disabled={isSaving}
            >
              <Share2 className="h-4 w-4" />
              <span>Compartilhar</span>
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="destructive"
              className="flex items-center gap-2 shadow-md transition-transform transform hover:scale-105"
              onClick={() => {
                onDelete();
                setIsExpanded(false);
              }}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </Button>
          )}
        </>
      )}
      
      <Button
        size="icon"
        className={`h-14 w-14 rounded-full shadow-lg transition-transform transform hover:scale-105 ${
          isExpanded ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        }`}
        onClick={toggleMenu}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <MoreVertical className="h-6 w-6" />}
      </Button>
    </div>
  );
}
