
import React from "react";

export function LoadingState() {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Carregando checklist...</p>
      </div>
    </div>
  );
}
