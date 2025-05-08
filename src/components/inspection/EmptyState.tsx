
import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          {description}
        </p>
        
        {action}
      </CardContent>
    </Card>
  );
}
