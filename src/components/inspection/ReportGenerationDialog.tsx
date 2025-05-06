
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
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { 
  generateInspectionReport, 
  generateInspectionPDF, 
  generateMockPDF 
} from "@/services/inspection/reportService";
import { supabase } from "@/integrations/supabase/client";

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
  const [uploading, setUploading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  const [format, setFormat] = useState<string>("pdf");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeActionPlans, setIncludeActionPlans] = useState(true);
  const [includeCompanyLogo, setIncludeCompanyLogo] = useState(true);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Convert to data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setCompanyLogo(reader.result as string);
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read the image file");
        setUploading(false);
      };
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
      setUploading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      
      const logoToUse = includeCompanyLogo ? companyLogo : null;
      
      await generateInspectionReport({
        inspectionId,
        includeImages,
        includeComments,
        includeActionPlans,
        format: format as 'pdf' | 'excel' | 'csv',
        companyLogo: logoToUse || undefined
      });
      
      // Save the report URL to the database
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
          await supabase.from("reports").insert({
            inspection_id: inspectionId,
            user_id: data.user.id,
            status: "completed",
            action_plan: includeActionPlans ? { included: true } : { included: false },
            format: format
          });
        }
      } catch (dbError) {
        console.error("Error saving report record:", dbError);
      }
      
      toast.success(`Report generated successfully in ${format.toUpperCase()} format`);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error(`Error generating report: ${error.message || "Unknown error"}`);
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
            Generate Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Inspection Report</DialogTitle>
          <DialogDescription>
            Select options to generate the inspection report
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={format}
              onValueChange={setFormat}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Content</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-images" 
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(!!checked)}
                disabled={format !== 'pdf'}
              />
              <Label 
                htmlFor="include-images" 
                className={`text-sm ${format !== 'pdf' ? 'text-muted-foreground' : ''}`}
              >
                Include images {format !== 'pdf' && "(PDF only)"}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-comments" 
                checked={includeComments}
                onCheckedChange={(checked) => setIncludeComments(!!checked)}
              />
              <Label htmlFor="include-comments" className="text-sm">Include comments</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-action-plans" 
                checked={includeActionPlans}
                onCheckedChange={(checked) => setIncludeActionPlans(!!checked)}
              />
              <Label htmlFor="include-action-plans" className="text-sm">Include action plans</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-company-logo" 
                checked={includeCompanyLogo}
                onCheckedChange={(checked) => setIncludeCompanyLogo(!!checked)}
                disabled={format !== 'pdf'}
              />
              <Label 
                htmlFor="include-company-logo" 
                className={`text-sm ${format !== 'pdf' ? 'text-muted-foreground' : ''}`}
              >
                Include company logo {format !== 'pdf' && "(PDF only)"}
              </Label>
            </div>
            
            {includeCompanyLogo && format === 'pdf' && (
              <div className="pt-2">
                <Label htmlFor="company-logo" className="text-sm">Upload logo (optional)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    disabled={uploading} 
                    asChild
                  >
                    <label htmlFor="logo-upload" className="cursor-pointer flex items-center justify-center">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {companyLogo ? "Change logo" : "Upload logo"}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </Button>
                  
                  {companyLogo && (
                    <div className="h-10 w-10 border rounded overflow-hidden">
                      <img 
                        src={companyLogo} 
                        alt="Company logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
