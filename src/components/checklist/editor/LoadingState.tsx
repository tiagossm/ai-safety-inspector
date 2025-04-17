
import React from "react";

export function LoadingState() {
  return (
    <div className="py-20 text-center">
      <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <div className="w-6 h-6 rounded-full bg-primary/40"></div>
      </div>
      <p className="text-muted-foreground">Carregando editor...</p>
    </div>
  );
}
