import { NavLink } from "react-router-dom"; 
import "./TMSidebar.css";

export default function AdminSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "🏠",
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: "👨‍🎓",
    },
    {
      name: "Teachers",
      path: "/admin/teachers",
      icon: "🧑‍🏫",
    },
    {
      name: "Managers",
      path: "/admin/managers",
      icon: "👨‍💼"
    },
    {
      name: "Certificates",
      path: "/admin/certificates",
      icon: "🪪"
    }
  ];

  return (
    <aside className="teacher-sidebar">
      <div className="teacher-sidebar-header">
        <h2>InternTrack</h2>
        <p>Admin Panel</p>
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