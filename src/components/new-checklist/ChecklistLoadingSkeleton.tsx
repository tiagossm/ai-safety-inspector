
import React from "react";

export function ChecklistLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border rounded-md p-4 animate-pulse">
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}
