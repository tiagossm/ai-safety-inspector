
import { Skeleton } from "@/components/ui/skeleton";

interface InspectionHeaderProps {
  loading: boolean;
  inspection: any;
}

export function InspectionHeader({ loading, inspection }: InspectionHeaderProps) {
  if (loading) {
    return (
      <div className="mb-4">
        <Skeleton className="h-7 w-2/3 max-w-md mb-1" />
        <Skeleton className="h-4 w-1/3 max-w-xs" />
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <h1 className="text-xl font-medium text-gray-800">{inspection?.title || "Inspeção"}</h1>
      <p className="text-sm text-gray-500">{inspection?.description || "Execução de checklist"}</p>
    </div>
  );
}
