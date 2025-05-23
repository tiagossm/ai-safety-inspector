
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";

// Lazy loaded components
const ChecklistEditorPage = lazy(() => import("@/pages/ChecklistEditorPage"));
const Checklists = lazy(() => import("@/pages/Checklists"));
const ChecklistDetails = lazy(() => import("@/pages/ChecklistDetails"));
const CreateChecklist = lazy(() => import("@/pages/CreateChecklist"));
const ActionPlansPage = lazy(() => import("@/pages/ActionPlansPage"));

// Direct imports for inspection pages
import NewChecklists from "./NewChecklists";
import NewChecklistCreate from "./NewChecklistCreate";
import NewChecklistEdit from "./NewChecklistEdit";
import NewChecklistDetails from "./NewChecklistDetails";
import NewInspectionPage from "./NewInspectionPage";
import InspectionExecutionPage from "./InspectionExecutionPage";
import ChecklistRedirectPage from "./ChecklistRedirectPage";
import SimpleInspectionPage from "./SimpleInspectionPage";

export const checklistRoutes = [
  <Route key="checklists" path="/checklists" element={<RequireAuth><Checklists /></RequireAuth>} />,
  <Route key="checklists-id" path="/checklists/:id" element={<RequireAuth><ChecklistDetails /></RequireAuth>} />,
  <Route key="checklists-editor" path="/checklists/editor" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />,
  <Route key="checklists-editor-id" path="/checklists/editor/:id" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />,
  <Route key="create-checklist" path="/create-checklist" element={<RequireAuth><CreateChecklist /></RequireAuth>} />,
  
  <Route key="new-checklists" path="/new-checklists" element={<RequireAuth><NewChecklists /></RequireAuth>} />,
  <Route key="new-checklists-create" path="/new-checklists/create" element={<RequireAuth><NewChecklistCreate /></RequireAuth>} />,
  <Route key="new-checklists-edit-id" path="/new-checklists/edit/:id" element={<RequireAuth><NewChecklistEdit /></RequireAuth>} />,
  <Route key="new-checklists-id-edit" path="/new-checklists/:id/edit" element={<RequireAuth><NewChecklistEdit /></RequireAuth>} />,
  <Route key="new-checklists-id" path="/new-checklists/:id" element={<RequireAuth><NewChecklistDetails /></RequireAuth>} />,
  
  // Updated inspection routes - Order matters for correct matching (most specific first)
  <Route key="inspections-redirect-id" path="/inspections/redirect/:id" element={<RequireAuth><ChecklistRedirectPage /></RequireAuth>} />,
  <Route key="inspections-new-with-id" path="/inspections/new/:id" element={<RequireAuth><NewInspectionPage /></RequireAuth>} />,
  <Route key="inspections-new" path="/inspections/new" element={<RequireAuth><NewInspectionPage /></RequireAuth>} />,
  <Route key="inspections-id-view" path="/inspections/:id/view" element={<RequireAuth><InspectionExecutionPage /></RequireAuth>} />,
  <Route key="inspections-id-action-plans" path="/inspections/:id/action-plans" element={<RequireAuth><ActionPlansPage /></RequireAuth>} />,
  <Route key="inspections-id" path="/inspections/:id" element={<RequireAuth><SimpleInspectionPage /></RequireAuth>} />,
];

export default function AppRoutes() {
  return (
    <Routes>
      {checklistRoutes}
    </Routes>
  );
}
