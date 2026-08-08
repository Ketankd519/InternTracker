import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

import StudentDashboard from './pages/Student/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import ManagerDashboard from './pages/Manager/Dashboard';
import Certificate from './pages/Certificate/Certificate';

import StudentProfile from "./pages/Student/StudentProfile";
import Internship from "./pages/Student/Internship";
import WeeklyReport from './pages/Student/WeeklyReport';
import Progress from './pages/Student/Progress';


import './App.css';

function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/internship"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Internship />
            </ProtectedRoute>
          }
          />

        <Route
          path="/student/weekly-report"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <WeeklyReport />
            </ProtectedRoute>
          }
        />

        <Route
         path="/student/progress"
         element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Progress />
          </ProtectedRoute>
         }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificate"
          element={
            <ProtectedRoute
              allowedRoles={['student', 'teacher', 'manager', 'admin']}
            >
              <Certificate />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </AuthProvider>
  );
}

export default App;