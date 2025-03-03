
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Checklists from "./pages/Checklists";
import Inspections from "./pages/Inspections";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./components/AuthProvider";
import AdminDashboard from "./pages/AdminDashboard";
import ChecklistDetail from "./pages/ChecklistDetail";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/checklists/:id" element={<ChecklistDetail />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
