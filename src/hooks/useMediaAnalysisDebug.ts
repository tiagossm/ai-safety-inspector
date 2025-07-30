import { useState, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function useMediaAnalysisDebug() {
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  // Atalho Ctrl+Shift+D para abrir o debug dashboard
  useHotkeys('ctrl+shift+d', () => {
    setIsDebugOpen(true);
  }, { enableOnFormTags: true });

  const openDebug = useCallback(() => {
    setIsDebugOpen(true);
  }, []);

  const closeDebug = useCallback(() => {
    setIsDebugOpen(false);
  }, []);

  return {
    isDebugOpen,
    openDebug,
    closeDebug
  };
}