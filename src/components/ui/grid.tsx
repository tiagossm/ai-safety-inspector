
import React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Grid({ className, children, ...props }: GridProps) {
  return (
    <div
      className={cn("grid", className)}
      {...props}
    >
      {children}
    </div>
  );
}
