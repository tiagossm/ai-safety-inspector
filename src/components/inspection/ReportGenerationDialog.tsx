
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { generateMockPDF } from "@/services/inspection/reportService";

interface ReportGenerationDialogProps {
  inspectionId: string;
  inspectionData: any;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ReportGenerationDialog({
  inspectionId,
  inspectionData,
  trigger,
  onOpenChange
}: ReportGenerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [format, setFormat] = useState<string>("pdf");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeActionPlans, setIncludeActionPlans] = useState(true);
  const [includeCompanyLogo, setIncludeCompanyLogo] = useState(true);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      
      // For now, we use the mock PDF generator
      generateMockPDF(inspectionId, inspectionData);
      
      toast.success("Relatório gerado com sucesso");
      
      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(`Erro ao gerar relatório: ${error.message || "Erro desconhecido"}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório de Inspeção</DialogTitle>
          <DialogDescription>
            Selecione as opções para gerar o relatório da inspeção
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">Formato</Label>
            <Select
              value={format}
              onValueChange={setFormat}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Conteúdo</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-images" 
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(!!checked)}
              />
              <Label htmlFor="include-images" className="text-sm">Incluir imagens</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-comments" 
                checked={includeComments}
                onCheckedChange={(checked) => setIncludeComments(!!checked)}
              />
              <Label htmlFor="include-comments" className="text-sm">Incluir comentários</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-action-plans" 
                checked={includeActionPlans}
                onCheckedChange={(checked) => setIncludeActionPlans(!!checked)}
              />
              <Label htmlFor="include-action-plans" className="text-sm">Incluir planos de ação</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-company-logo" 
                checked={includeCompanyLogo}
                onCheckedChange={(checked) => setIncludeCompanyLogo(!!checked)}
              />
              <Label htmlFor="include-company-logo" className="text-sm">Incluir logo da empresa</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={generating}
          >
            Cancelar
          </Button>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
