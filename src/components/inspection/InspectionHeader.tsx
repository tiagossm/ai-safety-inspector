
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InspectionDetails } from "@/types/newChecklist";

interface InspectionHeaderProps {
  loading: boolean;
  inspection: InspectionDetails | null;
}

export function InspectionHeader({ loading, inspection }: InspectionHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>
      
      <div>
        <h1 className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-64" /> : inspection?.title}
        </h1>
        {loading ? <Skeleton className="h-4 w-48 mt-1" /> : 
          inspection?.description && <p className="text-muted-foreground">{inspection.description}</p>
        }
      </div>
    </div>
  );
}
