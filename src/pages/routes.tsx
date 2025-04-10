
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
import InspectionExecutionPage from "./InspectionExecutionPage";
import NotFound from "./NotFound";

// Export the routes as an array instead of a component
export const checklistRoutes = [
  <Route key="checklists" path="/checklists" element={<RequireAuth><Checklists /></RequireAuth>} />,
  <Route key="checklists-id" path="/checklists/:id" element={<RequireAuth><ChecklistDetails /></RequireAuth>} />,
  <Route key="checklists-editor" path="/checklists/editor" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />,
  <Route key="checklists-editor-id" path="/checklists/editor/:id" element={<RequireAuth><ChecklistEditorPage /></RequireAuth>} />,
  <Route key="create-checklist" path="/create-checklist" element={<RequireAuth><CreateChecklist /></RequireAuth>} />,
  
  <Route key="new-checklists" path="/new-checklists" element={<RequireAuth><NewChecklists /></RequireAuth>} />,
  <Route key="new-checklists-create" path="/new-checklists/create" element={<RequireAuth><NewChecklistCreate /></RequireAuth>} />,
  <Route key="new-checklists-edit" path="/new-checklists/:id/edit" element={<RequireAuth><NewChecklistEdit /></RequireAuth>} />,
  <Route key="new-checklists-details" path="/new-checklists/:id" element={<RequireAuth><NewChecklistDetails /></RequireAuth>} />,
  <Route key="inspections-new" path="/inspections/new" element={<RequireAuth><NewInspectionPage /></RequireAuth>} />,
  <Route key="inspections-new-checklist" path="/inspections/new/:id" element={<RequireAuth><NewInspectionPage /></RequireAuth>} />,
  <Route key="inspections-id" path="/inspections/:id" element={<RequireAuth><InspectionExecutionPage /></RequireAuth>} />,
  <Route key="inspections-id-view" path="/inspections/:id/view" element={<RequireAuth><InspectionExecutionPage /></RequireAuth>} />,
  
  <Route key="not-found" path="*" element={<NotFound />} />
];

export default function AppRoutes() {
  return (
    <Routes>
      {checklistRoutes}
    </Routes>
  );
}
