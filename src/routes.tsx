
import React from 'react';
import { Navigate, RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";

// Updated Layout component to explicitly accept children
const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      {children || <Outlet />}
    </div>
  );
};

// Placeholder page components
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="container py-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

const HomePage = () => <PlaceholderPage title="Home" />;
const ChecklistPage = () => <PlaceholderPage title="Checklist" />;
const ChecklistDetails = () => <PlaceholderPage title="Checklist Details" />;
const CompaniesPage = () => <PlaceholderPage title="Companies" />;
const LoginPage = () => <PlaceholderPage title="Login" />;
const RegisterPage = () => <PlaceholderPage title="Register" />;
const ResetPasswordPage = () => <PlaceholderPage title="Reset Password" />;
const DocumentsPage = () => <PlaceholderPage title="Documents" />;
const DocumentDetails = () => <PlaceholderPage title="Document Details" />;
const InspectionsPage = () => <PlaceholderPage title="Inspections" />;
const InspectionCreate = () => <PlaceholderPage title="Create Inspection" />;
const UsersPage = () => <PlaceholderPage title="Users" />;
const ProfilePage = () => <PlaceholderPage title="Profile" />;
const SettingsPage = () => <PlaceholderPage title="Settings" />;
const ErrorPage = () => <PlaceholderPage title="Error" />;

// Import only the components we already have
import Checklists from "@/pages/Checklists";
import NewChecklistDetails from "@/pages/NewChecklistDetails";
import NewChecklistEdit from "@/pages/NewChecklistEdit";
import NewChecklistCreate from "@/pages/NewChecklistCreate";
import InspectionExecutionPage from "@/pages/InspectionExecutionPage";
import NewInspectionExecutionPage from "@/pages/NewInspectionExecutionPage";
import SharedInspectionView from "@/pages/SharedInspectionView";

export const router = [
  {
    path: "/",
    element: <Layout><Outlet /></Layout>,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "companies",
        element: <CompaniesPage />,
      },
      {
        path: "checklists",
        element: <Checklists />,
      },
      {
        path: "checklists/:id",
        element: <ChecklistDetails />,
      },
      {
        path: "checklists/create",
        element: <ChecklistPage />,
      },
      {
        path: "new-checklists",
        element: <Checklists />,
      },
      {
        path: "new-checklists/:id",
        element: <NewChecklistDetails />,
      },
      {
        path: "new-checklists/:id/edit",
        element: <NewChecklistEdit />,
      },
      {
        path: "new-checklists/create",
        element: <NewChecklistCreate />,
      },
      {
        path: "inspections",
        element: <InspectionsPage />,
      },
      {
        path: "inspections/new",
        element: <InspectionCreate />,
      },
      {
        path: "inspections/:id/view",
        element: <NewInspectionExecutionPage />,
      },
      {
        path: "documents",
        element: <DocumentsPage />,
      },
      {
        path: "documents/:id",
        element: <DocumentDetails />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/share/:id",
    element: <SharedInspectionView />,
  },
];

export default function Routes() {
  return router;
}
