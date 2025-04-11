
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface GroupsSidebarProps {
  groups: any[];
  currentGroupId: string | null;
  setCurrentGroupId: (id: string) => void;
  stats: any;
}

export function GroupsSidebar({ 
  groups, 
  currentGroupId, 
  setCurrentGroupId,
  stats
}: GroupsSidebarProps) {
  // If no groups are provided, return nothing
  if (!groups || groups.length === 0) {
    return null;
  }
  
  return (
    <div className="w-64 flex-shrink-0 border-r pr-2">
      <h3 className="font-medium mb-2 px-2">Grupos</h3>
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-1 py-1">
          {groups.map((group) => {
            // Get stats for this group
            const groupStat = stats?.groupStats?.[group.id] || { total: 0, completed: 0 };
            const isComplete = groupStat.completed === groupStat.total && groupStat.total > 0;
            const progress = groupStat.total > 0 
              ? Math.round((groupStat.completed / groupStat.total) * 100) 
              : 0;
            
            return (
              <Button
                key={group.id}
                variant={currentGroupId === group.id ? "secondary" : "ghost"}
                onClick={() => setCurrentGroupId(group.id)}
                className="w-full justify-start text-left relative"
              >
                <span className="truncate flex-1">{group.title}</span>
                <div className="flex items-center gap-1 text-xs">
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <span className="text-gray-500">{progress}%</span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
