import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { checklistRoutes } from "./pages/routes";
import { AppSidebar } from "./components/AppSidebar";

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
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-4 overflow-x-hidden">
        <Routes>
          {/* Include all routes from checklistRoutes array */}
          {checklistRoutes}
          
          {/* Legacy routes - keep these for compatibility */}
          <Route path="/" element={<Inspections />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/new" element={<CompanyDetail />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
        </Routes>
        <FloatingNavigation threshold={400} />
        <Toaster />
      </main>
    </div>
  );
}

export default App;
