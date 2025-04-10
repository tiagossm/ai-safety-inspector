
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionGroupsProps {
  groups: any[];
  currentGroupId: string | null;
  onGroupChange: (groupId: string) => void;
  stats: any;
}

export function QuestionGroups({ 
  groups, 
  currentGroupId, 
  onGroupChange,
  stats
}: QuestionGroupsProps) {
  // Calculate questions per group
  const groupQuestionsCount = groups.reduce((acc, group) => {
    acc[group.id] = stats.groupStats?.[group.id]?.total || 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-1 px-4 pt-4">
        <CardTitle className="text-base font-medium text-gray-800">Seções</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ScrollArea className="h-[180px] pr-3">
          <div className="space-y-1.5">
            {groups.map((group) => (
              <Button
                key={group.id}
                variant={currentGroupId === group.id ? "default" : "outline"}
                className={`w-full justify-start text-sm h-9 ${
                  currentGroupId === group.id 
                    ? "" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => onGroupChange(group.id)}
              >
                <span className="truncate">{group.title}</span>
                {groupQuestionsCount[group.id] > 0 && (
                  <span className="ml-auto bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                    {groupQuestionsCount[group.id]}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
