
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

// Import your page components
import InspectionExecutionPage from "./pages/InspectionExecutionPage";
import ChecklistEditorPage from "./pages/ChecklistEditorPage";
import ChecklistDetails from "./pages/ChecklistDetails";
import ChecklistDetail from "./pages/ChecklistDetail";
import NewInspectionPage from "./pages/NewInspectionPage";
import Inspections from "./pages/Inspections";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Checklists from "./pages/Checklists";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Inspections />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/inspections/new" element={<NewInspectionPage />} />
          <Route path="/inspections/:id" element={<InspectionExecutionPage />} />
          
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/checklists/new" element={<ChecklistEditorPage />} />
          <Route path="/checklists/:id/edit" element={<ChecklistEditorPage />} />
          <Route path="/checklists/editor" element={<ChecklistEditorPage />} />
          <Route path="/checklists/:id" element={<ChecklistDetails />} />
          <Route path="/checklist/:id" element={<ChecklistDetail />} />
          
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/new" element={<CompanyDetail />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
        </Routes>
        <FloatingNavigation threshold={400} />
      </Router>
      <Toaster />
    </>
  );
}

export default App;
