
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

import ChecklistPage from "@/pages/ChecklistPage";
import ChecklistDetails from "@/pages/ChecklistDetails";

import HomePage from "@/pages/HomePage";
import CompaniesPage from "@/pages/CompaniesPage";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

import DocumentsPage from "@/pages/DocumentsPage";
import DocumentDetails from "@/pages/DocumentDetails";

import Checklists from "@/pages/Checklists";
import NewChecklistDetails from "@/pages/NewChecklistDetails";
import NewChecklistEdit from "@/pages/NewChecklistEdit";
import NewChecklistCreate from "@/pages/NewChecklistCreate";

import InspectionsPage from "@/pages/InspectionsPage";
import InspectionCreate from "@/pages/InspectionCreate";
import InspectionExecutionPage from "@/pages/InspectionExecutionPage";
import NewInspectionExecutionPage from "@/pages/NewInspectionExecutionPage";
import SharedInspectionView from "@/pages/SharedInspectionView";

import UsersPage from "@/pages/UsersPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import ErrorPage from "@/pages/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
]);
