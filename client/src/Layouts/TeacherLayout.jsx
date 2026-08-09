import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";

export default function TeacherLayout() {
  return (
    <div className="teacher-layout">

      <TeacherSidebar />

      <main className="teacher-main">
        <Outlet />
      </main>

    </div>
  );
}