import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";

const ChecklistEditorPage = lazy(() => import("@/pages/ChecklistEditorPage"));
const Checklists = lazy(() => import("@/pages/Checklists"));
const ChecklistDetails = lazy(() => import("@/pages/ChecklistDetails"));
const CreateChecklist = lazy(() => import("@/pages/CreateChecklist"));

import NewChecklists from "./NewChecklists";
import NewChecklistCreate from "./NewChecklistCreate";
import NewChecklistEdit from "./NewChecklistEdit";
import NewChecklistDetails from "./NewChecklistDetails";

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

export default function Router() {
  return (
    <Routes>
      <Route path="/checklists" element={<Checklists />} />
      <Route path="/checklists/:id" element={<ChecklistDetails />} />
      <Route path="/checklists/editor" element={<ChecklistEditorPage />} />
      <Route path="/checklists/editor/:id" element={<ChecklistEditorPage />} />
      <Route path="/create-checklist" element={<CreateChecklist />} />
      
      <Route path="/new-checklists" element={<NewChecklists />} />
      <Route path="/new-checklists/create" element={<NewChecklistCreate />} />
      <Route path="/new-checklists/edit/:id" element={<NewChecklistEdit />} />
      <Route path="/new-checklists/:id" element={<NewChecklistDetails />} />
    </Routes>
  );
}
