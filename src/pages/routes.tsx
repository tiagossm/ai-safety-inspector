
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";

const ChecklistEditorPage = lazy(() => import("@/pages/ChecklistEditorPage"));

export function ChecklistEditorRoute() {
  return (
    <Route 
      path="/checklists/editor" 
      element={
        <RequireAuth>
          <Suspense fallback={<div className="py-20 text-center">Carregando editor...</div>}>
            <ChecklistEditorPage />
          </Suspense>
        </RequireAuth>
      } 
    />
  );
}
