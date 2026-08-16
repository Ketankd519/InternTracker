import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/ManagerSidebar";

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