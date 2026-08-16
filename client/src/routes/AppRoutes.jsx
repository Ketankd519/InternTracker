import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import StudentDashboard from "../pages/Student/Dashboard";
import TeacherDashboard from "../pages/Teacher/Dashboard";
import ManagerDashboard from "../pages/Manager/Dashboard";
import Certificate from "../pages/Certificate/Certificate";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/certificate" element={<ProtectedRoute allowedRoles={["student"]}><Certificate /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;