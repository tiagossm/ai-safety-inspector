import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";

// Import your page components
import InspectionExecutionPage from "./pages/InspectionExecutionPage";
import ChecklistEditorPage from "./pages/ChecklistEditorPage";
import ChecklistDetails from "./pages/ChecklistDetails";
import ChecklistDetail from "./pages/ChecklistDetail";
import ChecklistsPage from "./pages/ChecklistsPage";
import NewInspectionPage from "./pages/NewInspectionPage";
import InspectionsPage from "./pages/InspectionsPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage";
import NewCompanyPage from "./pages/NewCompanyPage";
import ResponsiblePage from "./pages/ResponsiblePage";
import NewResponsiblePage from "./pages/NewResponsiblePage";
import ResponsibleDetailsPage from "./pages/ResponsibleDetailsPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<InspectionsPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/inspections/new" element={<NewInspectionPage />} />
          <Route path="/inspections/:id" element={<InspectionExecutionPage />} />
          
          <Route path="/checklists" element={<ChecklistsPage />} />
          <Route path="/checklists/new" element={<ChecklistEditorPage />} />
          <Route path="/checklists/:id/edit" element={<ChecklistEditorPage />} />
          <Route path="/checklists/editor" element={<ChecklistEditorPage />} />
          <Route path="/checklists/:id" element={<ChecklistDetails />} />
          <Route path="/checklist/:id" element={<ChecklistDetail />} />
          
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/new" element={<NewCompanyPage />} />
          <Route path="/companies/:id" element={<CompanyDetailsPage />} />
          
          <Route path="/responsible" element={<ResponsiblePage />} />
          <Route path="/responsible/new" element={<NewResponsiblePage />} />
          <Route path="/responsible/:id" element={<ResponsibleDetailsPage />} />
        </Routes>
        <FloatingNavigation threshold={400} />
      </Router>
      <Toaster />
    </>
  );
}

export default App;
