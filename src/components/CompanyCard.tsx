
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { CompanyEditDialog } from "@/components/CompanyEditDialog";
import { Company, CompanyMetadata } from "@/types/company";
import { CompanyActions } from "@/components/company/CompanyActions";
import { CompanyDetails, CompanyTitle } from "@/components/company/CompanyDetails";
import { CompanyUnits } from "@/components/company/CompanyUnits";
import { generateCSV } from "@/utils/companyUtils";

interface CompanyCardProps {
  company: Company;
  onDelete: (id: string) => void;
  onEdit: (company: Company) => void;
  onStartInspection: (company: Company) => void;
  onViewLegalNorms: (company: Company) => void;
}

export function CompanyCard({
  company,
  onDelete,
  onEdit,
  onStartInspection,
  onViewLegalNorms,
}: CompanyCardProps) {
  const [unitsExpanded, setUnitsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const metadata = company.metadata as CompanyMetadata | null;
  const units = metadata?.units || [];

  const handleEdit = () => {
    setIsEditing(true);
    onEdit(company);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CompanyTitle company={company} />
          <CompanyActions
            company={company}
            unitsExpanded={unitsExpanded}
            unitsCount={units.length}
            onDelete={onDelete}
            onEdit={handleEdit}
            onStartInspection={onStartInspection}
            onViewLegalNorms={onViewLegalNorms}
            onToggleUnits={() => setUnitsExpanded(!unitsExpanded)}
            onExportCSV={() => generateCSV(company, units)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CompanyDetails company={company} />
        <CompanyUnits units={units} expanded={unitsExpanded} />
      </CardContent>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger />
        {isEditing && (
          <CompanyEditDialog
            company={company}
            onUpdate={onEdit}
            onClose={handleCloseEdit}
          />
        )}
      </Dialog>
    </Card>
  );
}
