
import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Checklists from "./pages/Checklists";
import Reports from "./pages/Reports";
import Inspections from "./pages/Inspections";
import Incidents from "./pages/Incidents";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import ChecklistDetails from "./pages/ChecklistDetails";
import CreateChecklist from "./pages/CreateChecklist";
import AddUnit from "./pages/AddUnit";
import BillingPage from "./pages/BillingPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/companies",
    element: <ProtectedRoute><Companies /></ProtectedRoute>,
  },
  {
    path: "/companies/add-unit/:companyId",
    element: <ProtectedRoute><AddUnit /></ProtectedRoute>,
  },
  {
    path: "/checklists",
    element: <ProtectedRoute><Checklists /></ProtectedRoute>,
  },
  {
    path: "/checklists/create",
    element: <ProtectedRoute><CreateChecklist /></ProtectedRoute>,
  },
  {
    path: "/checklists/:id",
    element: <ProtectedRoute><ChecklistDetails /></ProtectedRoute>,
  },
  {
    path: "/reports",
    element: <ProtectedRoute><Reports /></ProtectedRoute>,
  },
  {
    path: "/inspections",
    element: <ProtectedRoute><Inspections /></ProtectedRoute>,
  },
  {
    path: "/incidents",
    element: <ProtectedRoute><Incidents /></ProtectedRoute>,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: "/billing",
    element: <ProtectedRoute><BillingPage /></ProtectedRoute>,
  },
  {
    path: "/admin/dashboard",
    element: <ProtectedRoute requiredTier={["super_admin"]}><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: "/admin/users",
    element: <ProtectedRoute requiredTier={["super_admin"]}><Users /></ProtectedRoute>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
