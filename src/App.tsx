import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./store/authContext";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Dashboard/Overview";
import ProjectBoard from "./pages/Dashboard/ProjectBoard";
import ProjectsList from "./pages/Dashboard/ProjectsList";
import TeamView from "./pages/Dashboard/TeamView";
import CalendarView from "./pages/Dashboard/CalendarView";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#fff',
            color: '#0f172a',
            fontSize: '14px',
            padding: '12px 24px',
            border: '1px solid #e2e8f0'
          },
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Overview />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectsList />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/team" element={
            <ProtectedRoute>
              <DashboardLayout>
                <TeamView />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CalendarView />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectBoard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/tasks/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProjectBoard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
