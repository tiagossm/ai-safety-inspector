
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { InspectionDetails as InspectionDetailsType } from "@/types/newChecklist";

interface InspectionDetailsProps {
  loading: boolean;
  inspection: InspectionDetailsType | null;
  company: any;
  responsible: any;
}

export function InspectionDetailsCard({ loading, inspection, company, responsible }: InspectionDetailsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Inspection Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              {inspection?.status && getStatusBadge(inspection.status)}
            </div>
            
            {inspection?.priority && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Priority:</span>
                {getPriorityBadge(inspection.priority)}
              </div>
            )}
            
            {company && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{company.name}</p>
                </div>
              </div>
            )}
            
            {inspection?.locationName && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{inspection.locationName}</p>
                </div>
              </div>
            )}
            
            {responsible && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Responsible</p>
                  <p className="text-sm text-muted-foreground">{responsible.name}</p>
                </div>
              </div>
            )}
            
            {inspection?.scheduledDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Scheduled Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(inspection.scheduledDate), "PPP")}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
