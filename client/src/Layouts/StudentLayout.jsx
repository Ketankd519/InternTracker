import StudentSidebar from "../components/StudentSidebar";
import "../pages/Student/StudentStyle.css";

export default function StudentLayout({ children }) {
  return (
    <div className="student-layout">
      <StudentSidebar />

      <div className="student-content">
        {children}
      </div>
    </div>
  );
}