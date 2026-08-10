import { NavLink } from "react-router-dom";

export default function ManagerSidebar() {
  return (
    <aside className="manager-sidebar">
      <div className="manager-sidebar-header">
        <h2>InternTrack</h2>
        <p>Manager Panel</p>
      </div>

      <nav className="manager-sidebar-nav">
        <NavLink
          to="/manager/dashboard"
          className={({ isActive }) =>
            isActive
              ? "manager-nav-link active"
              : "manager-nav-link"
          }
        >
          <span>📊</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/manager/approvals"
          className={({ isActive }) =>
            isActive
              ? "manager-nav-link active"
              : "manager-nav-link"
          }
        >
          <span>📋</span>
          Approvals
        </NavLink>

        <NavLink
          to="/manager/evaluation"
          className={({ isActive }) =>
            isActive
              ? "manager-nav-link active"
              : "manager-nav-link"
          }
        >
          <span>📝</span>
          Evaluation
        </NavLink>

      </nav>
    </aside>
  );
}