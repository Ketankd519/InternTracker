import { NavLink } from "react-router-dom";
import "./TMSidebar.css";

export default function TeacherSidebar() {
const menuItems = [
    {
      name: "Dashboard",
      path: "/teacher/dashboard",
      icon: "🏠",
      disabled: false,
    },
    {
      name: "Profile",
      path: "/teacher/profile",
      icon: "👤",
      disabled: true,
    },
    {
      name: "view Students",
      path: "/teacher/students",
      icon: "👨‍🎓",
      disabled: false,
    },
    {
      name: "Reports",
      path: "/teacher/reports",
      icon: "📄",
      disabled: true,
    },
    {
      name: "Analytics",
      path: "/teacher/analytics",
      icon: "📊",
      disabled: true,
    },
  ];

  return (
    <aside className="teacher-sidebar">

      <div className="teacher-sidebar-header">
        <h2>InternTrack</h2>
        <p>Teacher Panel</p>
       </div>

      <ul className="teacher-sidebar-menu">

      {menuItems.map((item) => (
          <li key={item.name}>

            {item.disabled ? (
              <div className="teacher-sidebar-link disabled">
                <span className="teacher-sidebar-icon">
                  {item.icon}
                </span>
                <span>{item.name}</span>
                <span className="sidebar-coming-soon">
                  Soon
                </span>
              </div>
            ) : (
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
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}