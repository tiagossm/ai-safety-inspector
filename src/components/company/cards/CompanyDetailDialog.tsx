
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Company } from "@/types/company";
import { CompanyDetails } from "../CompanyDetails";
import { CompanyContacts } from "../CompanyContacts";
import { CompanyUnits } from "../CompanyUnits";

interface CompanyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export const CompanyDetailDialog = ({ open, onOpenChange, company }: CompanyDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{company.fantasy_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <CompanyDetails company={company} />
          <CompanyContacts company={company} />
          <CompanyUnits company={company} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
