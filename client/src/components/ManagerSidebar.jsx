import { NavLink } from "react-router-dom";
import "./TMSidebar.css";

export default function ManagerSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/manager/dashboard",
      icon: "📊",
    },
    {
      name: "Approvals",
      path: "/manager/approvals",
      icon: "📋",
    },
    {
      name: "Evaluation",
      path: "/manager/evaluation",
      icon: "📝",
    },
  ];

  return (
    <aside className="teacher-sidebar">

      <div className="teacher-sidebar-header">
        <h2>InternTrack</h2>
        <p>Manager Panel</p>
      </div>

      <ul className="teacher-sidebar-menu">

        {menuItems.map((item) => (
          <li key={item.name}>

            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "teacher-sidebar-link active"
                  : "teacher-sidebar-link"
              }
            >
              <span className="teacher-sidebar-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>

          </li>
        ))}

      </ul>

    </aside>
  );
}