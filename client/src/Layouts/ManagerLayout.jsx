import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/ManagerSidebar";
import "../pages/Manager/ManagerStyle.css";

export default function ManagerLayout() {
  return (
    <div className="manager-layout">
      <ManagerSidebar />
      <main className="manager-content">
        <Outlet />
      </main>
    </div>
  );
}