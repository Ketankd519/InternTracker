import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import CertificateVerification from "./pages/Certificate/CertificateVerification";
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

import Certificate from "./pages/Certificate/Certificate";
import SSCertificate from "./pages/Certificate/SSCertificate";

import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/Student/Dashboard';
import StudentProfile from "./pages/Student/StudentProfile";
import Internship from "./pages/Student/Internship";
import WeeklyReport from './pages/Student/WeeklyReport';
import Progress from './pages/Student/Progress';

import TeacherLayout from "./Layouts/TeacherLayout";
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherStudents from "./pages/Teacher/Students";
import ViewStudent from "./pages/Teacher/ViewStudent";
import StdCertificateList from "./pages/Teacher/stdCertificateList";
import TCCertificate from "./pages/Certificate/TCCertificate";
import TeacherProfile from "./pages/Teacher/profile";

import ManagerLayout from "./Layouts/ManagerLayout";
import ManagerDashboard from './pages/Manager/Dashboard';
import ManagerApprovals from "./pages/Manager/Approvals";
import ManagerViewStudent from "./pages/Manager/ViewStudent";
import ManagerEvaluation from "./pages/Manager/Evaluation";
import ManagerCertificateList from "./pages/Manager/stdCertificateList";
import MCCertificate from "./pages/Certificate/MCCertificate";
import ManagerProfile from "./pages/Manager/profile";

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

          {/* Public Certificate Verification */}
        <Route
          path="/certificate-verification"
          element={<CertificateVerification />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />}/>
      
    // STUDENT ROUTES
      <Route path="/student" element={<StudentLayout/>}>

        <Route path="dashboard" element={
            // <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            // </ProtectedRoute>
          }
        />

        <Route path="profile" element={
            // <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentProfile />
            // </ProtectedRoute>
          }
        />

        <Route path="internship" element={
            // <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Internship />
            // </ProtectedRoute>
          }
          />

        <Route path="weekly-report" element={
            // <ProtectedRoute allowedRoles={['student', 'admin']}>
              <WeeklyReport />
            // </ProtectedRoute>
          }
        />

        <Route path="progress" element={
          //  <ProtectedRoute allowedRoles={['student', 'admin']}>
              <Progress />
          //  </ProtectedRoute>
         }
        />

        <Route path="certificate-status" element={<SSCertificate />}
        />

        <Route
          path="certificate"
          element={
            // <ProtectedRoute allowedRoles={["student"]}>
              <Certificate />
            // </ProtectedRoute>
          }
        />
      </Route>



<Route path="/teacher" element={<TeacherLayout />}>

  <Route
    path="dashboard"
    element={<TeacherDashboard />}
  />

  <Route
    path="/teacher/profile"
    element={<TeacherProfile />}
  />

  <Route
    path="students"
    element={<TeacherStudents />}
  />

  <Route
    path="students/:studentId"
    element={<ViewStudent />}
  />

  <Route
    path="student-certificates"
    element={<StdCertificateList />}
  />

  <Route
    path="student-certificate/:studentId"
    element={<TCCertificate />}
  />

</Route>

<Route
  path="/manager"
  element={<ManagerLayout />}
>

  <Route
    path="dashboard"
    element={<ManagerDashboard />}
  />

  <Route
    path="/manager/profile"
    element={<ManagerProfile />}
  />

  <Route
    path="approvals"
    element={<ManagerApprovals />}
  />

  <Route
    path="students/:studentId"
    element={<ManagerViewStudent />}
  />

  <Route
    path="evaluation"
    element={<ManagerEvaluation />}
  />

  <Route
    path="student-certificates"
    element={<ManagerCertificateList />}
  />

  <Route
    path="student-certificate/:studentId"
    element={<MCCertificate />}
  />

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