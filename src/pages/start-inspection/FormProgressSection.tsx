
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FormProgressSectionProps {
  formProgress: number;
}

export default function FormProgressSection({ formProgress }: FormProgressSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium">Progresso do formulário</p>
        <Badge variant="outline">{formProgress}%</Badge>
      </div>
      <Progress value={formProgress} className="h-2" />
    </div>
  );
}
