
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Report {
  id: string;
  inspection_id: string;
  created_at: string;
  status: string;
  format?: string;
  action_plan: any;
  // Add nested objects that come from the select query
  inspection?: {
    id: string;
    status: string;
    company?: {
      fantasy_name: string;
    };
    checklist?: {
      title: string;
    };
  };
}

export function ReportsHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const { data: reports, error } = await supabase
        .from("reports")
        .select(`
          *,
          inspection:inspection_id (
            id,
            status,
            company:company_id (fantasy_name),
            checklist:checklist_id (title)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setReports(reports || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      setError(error.message || "Failed to load reports");
      toast.error("Failed to load reports history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      // In a real implementation, this would fetch the report URL from storage
      // For now, we'll display a toast message
      toast.info("This functionality will be implemented soon");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-2">Error loading reports</p>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchReports}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="mb-2">No reports found</p>
          <p className="text-muted-foreground text-sm">
            Reports will appear here after you generate them from inspections
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className={`h-5 w-5 ${getFormatColor(report.format)}`} />
                <div>
                  <p className="font-medium">
                    {report.inspection?.checklist?.title || "Inspection Report"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.inspection?.company?.fantasy_name || "Unknown Company"} • 
                    {formatDate(report.created_at)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {report.format?.toUpperCase() || "PDF"}
                    </span>
                    {report.action_plan?.included && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                        Action Plan
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleDownload(report)}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getFormatColor(format?: string): string {
  switch (format?.toLowerCase()) {
    case 'pdf':
      return 'text-red-500';
    case 'excel':
      return 'text-green-500';
    case 'csv':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}
