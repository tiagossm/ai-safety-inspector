
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { generateInspectionPDFReport } from '@/services/inspection/reportService';
import { toast } from 'sonner';

interface PDFReportButtonProps {
  inspectionId: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function PDFReportButton({ 
  inspectionId, 
  variant = 'outline',
  size = 'default',
  className = ''
}: PDFReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      const pdfUrl = await generateInspectionPDFReport(inspectionId);
      
      if (pdfUrl) {
        // Abrir PDF em nova aba
        window.open(pdfUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Falha ao gerar relatório PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Relatório PDF
        </>
      )}
    </Button>
  );
}
