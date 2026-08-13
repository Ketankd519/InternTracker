import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

import Certificate from './pages/Certificate/Certificate';

import StudentDashboard from './pages/Student/Dashboard';
import StudentProfile from "./pages/Student/StudentProfile";
import Internship from "./pages/Student/Internship";
import WeeklyReport from './pages/Student/WeeklyReport';
import Progress from './pages/Student/Progress';

import TeacherLayout from "./Layouts/TeacherLayout";
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherStudents from "./pages/Teacher/Students";
import ViewStudent from "./pages/Teacher/ViewStudent";

import ManagerLayout from "./Layouts/ManagerLayout";
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerApprovals from "./pages/Manager/Approvals";
import ManagerViewStudent from "./pages/Manager/ViewStudent";
import ManagerEvaluation from "./pages/Manager/Evaluation";

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/register" element={<Register />}/>
        {/* <Route path="/forgot-password" element={<ForgotPassword />}/> */}
        
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

        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />}/>
          <Route path="students" element={<TeacherStudents />}/>
          <Route path="students/:studentId" element={<ViewStudent />}/>
        </Route>

        <Route path="/manager"element={<ManagerLayout />}>
          <Route path="dashboard" element={<ManagerDashboard />}/>
          <Route path="approvals" element={<ManagerApprovals />}/>
          <Route path="students/:studentId" element={<ManagerViewStudent />}/>
          <Route path="evaluation" element={<ManagerEvaluation />}/>
        </Route>

        <Route
          path="/certificate"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'manager', 'admin']}>
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