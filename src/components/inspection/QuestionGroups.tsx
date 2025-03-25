
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";

interface QuestionGroupsProps {
  groups: any[];
  currentGroupId: string | null;
  onGroupChange: (groupId: string | null) => void;
}

export function QuestionGroups({ groups, currentGroupId, onGroupChange }: QuestionGroupsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Question Groups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {groups.map(group => (
            <Button
              key={group.id}
              variant={currentGroupId === group.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onGroupChange(group.id)}
            >
              <Clipboard className="h-4 w-4 mr-2" />
              <span className="truncate">{group.title}</span>
            </Button>
          ))}
          
          <Button
            variant={currentGroupId === null ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onGroupChange(null)}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            <span>Ungrouped Questions</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
