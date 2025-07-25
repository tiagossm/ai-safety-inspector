import { useState, useEffect, useCallback, useRef } from 'react';
import { AutoSaveConfig, AutoSaveState, InspectionResponse } from './types';
import { useOptimizedResponseSaving } from './useOptimizedResponseSaving';
import { toast } from 'sonner';

const DEFAULT_CONFIG: AutoSaveConfig = {
  enabled: true,
  interval: 30, // 30 segundos
  debounceDelay: 2000, // 2 segundos
  maxRetries: 3
};

export function useAutoSave(
  inspectionId: string | undefined,
  responses: Record<string, InspectionResponse>,
  config: Partial<AutoSaveConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { saveMultipleResponses, isSaving } = useOptimizedResponseSaving();
  
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    pendingChanges: false,
    errorCount: 0
  });

  const pendingChangesRef = useRef<Record<string, InspectionResponse>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(async () => {
    if (!inspectionId || !finalConfig.enabled) return;

    const changesToSave = { ...pendingChangesRef.current };
    const changesArray = Object.entries(changesToSave).map(([questionId, response]) => ({
      questionId,
      ...response
    }));

    if (changesArray.length === 0) return;

    try {
      setAutoSaveState(prev => ({ ...prev, isSaving: true }));
      
      const success = await saveMultipleResponses(inspectionId, changesArray);
      
      if (success) {
        pendingChangesRef.current = {};
        setAutoSaveState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          pendingChanges: false,
          errorCount: 0
        }));
        
        console.log(`Auto-salvou ${changesArray.length} respostas`);
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (error) {
      console.error('Erro no auto-save:', error);
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        errorCount: prev.errorCount + 1
      }));

      if (autoSaveState.errorCount < finalConfig.maxRetries) {
        // Retry after a delay
        setTimeout(() => debouncedSave(), 5000);
      } else {
        toast.error('Auto-save falhou. Salve manualmente.');
      }
    }
  }, [inspectionId, finalConfig.enabled, finalConfig.maxRetries, saveMultipleResponses, autoSaveState.errorCount]);

  // Track changes in responses
  useEffect(() => {
    if (!finalConfig.enabled) return;

    const hasChanges = Object.keys(responses).some(questionId => {
      const currentResponse = responses[questionId];
      const pendingResponse = pendingChangesRef.current[questionId];
      
      return !pendingResponse || 
             JSON.stringify(currentResponse) !== JSON.stringify(pendingResponse);
    });

    if (hasChanges) {
      // Update pending changes
      Object.keys(responses).forEach(questionId => {
        if (responses[questionId]?.updatedAt) {
          pendingChangesRef.current[questionId] = responses[questionId];
        }
      });

      setAutoSaveState(prev => ({ ...prev, pendingChanges: true }));

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(debouncedSave, finalConfig.debounceDelay);
    }
  }, [responses, finalConfig.enabled, finalConfig.debounceDelay, debouncedSave]);

  // Periodic save interval
  useEffect(() => {
    if (!finalConfig.enabled) return;

    intervalRef.current = setInterval(() => {
      if (autoSaveState.pendingChanges && !autoSaveState.isSaving) {
        debouncedSave();
      }
    }, finalConfig.interval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [finalConfig.enabled, finalConfig.interval, autoSaveState.pendingChanges, autoSaveState.isSaving, debouncedSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await debouncedSave();
  }, [debouncedSave]);

  // Toggle auto-save
  const toggleAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveState(prev => ({ ...prev, pendingChanges: enabled ? prev.pendingChanges : false }));
    finalConfig.enabled = enabled;
  }, [finalConfig]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    ...autoSaveState,
    config: finalConfig,
    saveNow,
    toggleAutoSave,
    isSaving: autoSaveState.isSaving || isSaving
  };
}