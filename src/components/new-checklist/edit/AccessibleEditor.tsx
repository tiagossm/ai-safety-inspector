
import React, { useRef, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';

interface AccessibleEditorProps {
  children: React.ReactNode;
  onSave: () => Promise<void>;
  onAddQuestion: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AccessibleEditor({
  children,
  onSave,
  onAddQuestion,
  onCancel,
  isSubmitting
}: AccessibleEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up keyboard shortcuts
  useHotkeys('mod+s', (event) => {
    event.preventDefault();
    if (!isSubmitting) {
      onSave();
      toast.info('Salvando checklist...');
    }
  }, { enableOnFormTags: true });
  
  useHotkeys('mod+n', (event) => {
    event.preventDefault();
    onAddQuestion();
    toast.info('Nova pergunta adicionada');
  });
  
  useHotkeys('escape', (event) => {
    event.preventDefault();
    if (window.confirm('Tem certeza que deseja cancelar a edição?')) {
      onCancel();
    }
  });
  
  // Add ARIA attributes and focus handling
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Make container focusable
      if (!container.getAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
      }
      
      // Add role for screen readers
      if (!container.getAttribute('role')) {
        container.setAttribute('role', 'form');
      }
      
      // Add aria-label
      if (!container.getAttribute('aria-label')) {
        container.setAttribute('aria-label', 'Editor de checklist');
      }
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="checklist-editor-container"
      aria-live="polite"
      data-accessible-editor
    >
      <div className="sr-only">
        <p>Editor de Checklist. Pressione Ctrl+S para salvar, Ctrl+N para adicionar nova pergunta, ESC para cancelar.</p>
      </div>
      {children}
    </div>
  );
}
