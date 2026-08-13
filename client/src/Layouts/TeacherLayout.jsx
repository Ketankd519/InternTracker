import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";
import "../pages/Teacher/TeacherStyle.css";

export default function TeacherLayout() {
  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-main-content">
        <Outlet />
      </main>
    </div>
  );
}