
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface ActionPlanPageHeaderProps {
  inspectionId: string | undefined;
  inspectionTitle: string | undefined;
  companyName: string | undefined;
}

export function ActionPlanPageHeader({
  inspectionId,
  inspectionTitle,
  companyName,
}: ActionPlanPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <Link to={`/inspections/${inspectionId}`}>
          <Button variant="ghost" className="pl-0 mb-2">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Inspection
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Action Plans</h1>
        <p className="text-muted-foreground">
          {inspectionTitle || 'Inspection'} • {companyName || 'Company'}
        </p>
      </div>
    </div>
  );
}
