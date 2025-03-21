
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
import NewInspectionPage from "./NewInspectionPage";

export function ChecklistRoutes() {
  return (
    <>
      {/* Original checklist routes */}
      <Route path="/checklists" element={<RequireAuth><Checklists /></RequireAuth>} />
      <Route path="/checklists/:id" element={<RequireAuth><ChecklistDetails /></RequireAuth>} />
      <Route path="/checklists/editor" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />
      <Route path="/checklists/editor/:id" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />
      <Route path="/create-checklist" element={<RequireAuth><CreateChecklist /></RequireAuth>} />
      
      {/* New checklist routes with auth protection */}
      <Route path="/new-checklists" element={<RequireAuth><NewChecklists /></RequireAuth>} />
      <Route path="/new-checklists/create" element={<RequireAuth><NewChecklistCreate /></RequireAuth>} />
      <Route path="/new-checklists/edit/:id" element={<RequireAuth><NewChecklistEdit /></RequireAuth>} />
      <Route path="/new-checklists/:id" element={<RequireAuth><NewChecklistDetails /></RequireAuth>} />
      <Route path="/inspections/new/:id" element={<RequireAuth><NewInspectionPage /></RequireAuth>} />
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <ChecklistRoutes />
    </Routes>
  );
}
