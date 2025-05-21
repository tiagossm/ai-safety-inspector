
import React, { ReactNode } from "react";

interface ResponseWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ResponseWrapper({ children, className = "" }: ResponseWrapperProps) {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {children}
    </div>
  );
}
