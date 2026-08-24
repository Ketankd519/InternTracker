import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";

export default function StudentLayout() {
  return (
    <div className="student-layout">
      <StudentSidebar />
      <div className="student-content">
        <Outlet />
      </div>
    </div>
  );
}