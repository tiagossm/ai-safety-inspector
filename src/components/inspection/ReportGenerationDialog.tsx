
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { generateInspectionReport } from "@/services/inspection/reportService";
import { toast } from "sonner";

interface ReportGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
  companyName?: string;
  checklistTitle?: string;
}

export function ReportGenerationDialog({
  open,
  onOpenChange,
  inspectionId,
  companyName,
  checklistTitle
}: ReportGenerationDialogProps) {
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeActionPlans, setIncludeActionPlans] = useState(true);
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      
      const options = {
        inspectionId,
        includeImages,
        includeComments,
        includeActionPlans,
        format
      };
      
      await generateInspectionReport(options);
      
      toast.success("Relatório gerado com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório", {
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Relatório</DialogTitle>
          <DialogDescription>
            Selecione as opções para gerar o relatório da inspeção
            {checklistTitle && <span className="font-medium block mt-1">{checklistTitle}</span>}
            {companyName && <span className="text-muted-foreground">{companyName}</span>}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-2">
            <Label>Formato do Relatório</Label>
            <RadioGroup 
              value={format} 
              onValueChange={(value) => setFormat(value as "pdf" | "excel" | "csv")}
              className="flex flex-col gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileJson className="mr-2 h-4 w-4" />
                  CSV
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Content options */}
          <div className="space-y-3">
            <Label>Conteúdo do Relatório</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-images" className="cursor-pointer">
                Incluir imagens
              </Label>
              <Switch
                id="include-images"
                checked={includeImages}
                onCheckedChange={setIncludeImages}
                disabled={format !== "pdf"}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-comments" className="cursor-pointer">
                Incluir comentários
              </Label>
              <Switch
                id="include-comments"
                checked={includeComments}
                onCheckedChange={setIncludeComments}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-action-plans" className="cursor-pointer">
                Incluir planos de ação
              </Label>
              <Switch
                id="include-action-plans"
                checked={includeActionPlans}
                onCheckedChange={setIncludeActionPlans}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {generating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
