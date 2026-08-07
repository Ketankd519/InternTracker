import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import StudentDashboard from "../pages/Student/Dashboard";
import TeacherDashboard from "../pages/Teacher/Dashboard";
import ManagerDashboard from "../pages/Manager/Dashboard";
import Certificate from "../pages/Certificate/Certificate";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/student/dashboard" element={<StudentDashboard />} />

      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

      <Route path="/manager/dashboard" element={<ManagerDashboard />} />

      <Route path="/certificate" element={<Certificate />} />

    </Routes>
  );
}

export default AppRoutes;