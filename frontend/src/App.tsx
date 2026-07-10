import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

// Import Pages
import { Login } from "./pages/Auth/Login";
import { Signup } from "./pages/Auth/Signup";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { PropertyManagement } from "./pages/Property/PropertyManagement";
import { RoomManagement } from "./pages/Room/RoomManagement";
import { TenantManagement } from "./pages/Tenant/TenantManagement";
import { RentCollection } from "./pages/Rent/RentCollection";
import { Agreements } from "./pages/Agreement/Agreements";
import { MaintenanceList } from "./pages/Maintenance/MaintenanceList";
import { NoticeBoard } from "./pages/Notice/NoticeBoard";
import { Visitors } from "./pages/Visitor/Visitors";
import { AttendanceTracker } from "./pages/Attendance/AttendanceTracker";
import { ExpenseTracker } from "./pages/Expense/ExpenseTracker";
import { ReportsPanel } from "./pages/Reports/ReportsPanel";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "owner"]}>
            <Layout>
              <PropertyManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <ProtectedRoute allowedRoles={["owner", "staff"]}>
            <Layout>
              <RoomManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenants"
        element={
          <ProtectedRoute allowedRoles={["owner", "staff"]}>
            <Layout>
              <TenantManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rent"
        element={
          <ProtectedRoute>
            <Layout>
              <RentCollection />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agreements"
        element={
          <ProtectedRoute allowedRoles={["owner", "tenant"]}>
            <Layout>
              <Agreements />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Layout>
              <MaintenanceList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <Layout>
              <NoticeBoard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/visitors"
        element={
          <ProtectedRoute allowedRoles={["owner", "staff"]}>
            <Layout>
              <Visitors />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <AttendanceTracker />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={["owner", "staff"]}>
            <Layout>
              <ExpenseTracker />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "owner"]}>
            <Layout>
              <ReportsPanel />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
