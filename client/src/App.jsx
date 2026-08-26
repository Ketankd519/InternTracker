import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import CertificateVerification from "./pages/Certificate/CertificateVerification";
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

import Certificate from "./pages/Certificate/Certificate";
import SSCertificate from "./pages/Certificate/SSCertificate";

import StudentLayout from './Layouts/StudentLayout';
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

import AdminLayout from './Layouts/AdminLayouts';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminRoute from "./components/AdminRoute";
import AdminStudents from "./pages/Admin/Students";
import AdminViewStudent from "./pages/Admin/ViewStudent";
import AdminTeachers from "./pages/Admin/Teachers";
import AdminViewTeacher from "./pages/Admin/ViewTeacher";
import AdminManagers from "./pages/Admin/Managers";
import AdminViewManager from "./pages/Admin/ViewManager";

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Navbar />
        <Routes>
          
          //HOME ROUTES
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/certificate-verification" element={<CertificateVerification />}/>
          <Route path="/forgot-password" element={<ForgotPassword />}/>
      
          // STUDENT ROUTES
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />}/>
            <Route path="profile" element={<StudentProfile />}/>
            <Route path="internship" element={<Internship />}/>
            <Route path="weekly-report" element={<WeeklyReport />}/>
            <Route path="progress" element={<Progress />}/>
            <Route path="certificate-status" element={<SSCertificate />}/>
            <Route path="certificate" element={<Certificate />}/>
          </Route>

          // TEACHER ROUTES
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route path="dashboard" element={<TeacherDashboard />}/>
            <Route path="/teacher/profile" element={<TeacherProfile />}/>
            <Route path="students" element={<TeacherStudents />}/>
            <Route path="students/:studentId" element={<ViewStudent />}/>
            <Route path="student-certificates" element={<StdCertificateList />}/>
            <Route path="student-certificate/:studentId" element={<TCCertificate />}/>
          </Route>

          // MANAGER ROUTES 
          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="dashboard" element={<ManagerDashboard />}/>
            <Route path="/manager/profile" element={<ManagerProfile />}/>
            <Route path="approvals" element={<ManagerApprovals />}/>
            <Route path="students/:studentId" element={<ManagerViewStudent />}/>
            <Route path="evaluation" element={<ManagerEvaluation />}/>
            <Route path="student-certificates" element={<ManagerCertificateList />}/>
            <Route path="student-certificate/:studentId" element={<MCCertificate />}/>
          </Route>

          // ADMIN ROUTES
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:studentId" element={<AdminViewStudent />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="teachers/:teacherId" element={<AdminViewTeacher />} />
              <Route path="managers" element={<AdminManagers />} />
              <Route path="managers/:managerId" element={<AdminViewManager />} />
            </Route>
          </Route>
          
        </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;