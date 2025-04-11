
import React, { useState, useEffect } from "react";
import { Save, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveIndicatorProps {
  saving: boolean;
  lastSaved: Date | null;
  autoSave: boolean;
}

export function SaveIndicator({ saving, lastSaved, autoSave }: SaveIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  // Show the indicator when saving status changes or on mount
  useEffect(() => {
    if (saving) {
      setShowIndicator(true);
      setFadeOut(false);
    } else if (lastSaved) {
      // Show success for 3 seconds then fade out
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setShowIndicator(false), 500); // Wait for fade animation
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [saving, lastSaved]);
  
  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return "agora mesmo";
    if (diffMins === 1) return "há 1 minuto";
    if (diffMins < 60) return `há ${diffMins} minutos`;
    
    return `às ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  if (!showIndicator && !autoSave) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {autoSave && (
        <div className="mb-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-sm">
          <Check className="h-3.5 w-3.5" />
          <span>Salvamento automático ativado</span>
        </div>
      )}
      
      {showIndicator && (
        <div 
          className={cn(
            "bg-white border rounded-md shadow-md px-3 py-2 flex items-center gap-2 transition-opacity duration-500",
            fadeOut ? "opacity-0" : "opacity-100"
          )}
        >
          {saving ? (
            <>
              <Save className="h-4 w-4 text-blue-500 animate-pulse" />
              <span className="text-sm">Salvando alterações...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <div>
                <span className="text-sm font-medium">Salvo</span>
                <span className="text-xs text-gray-500 block">{formatLastSaved()}</span>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Não foi possível salvar</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
