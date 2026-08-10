import { NavLink } from "react-router-dom";
import "./TeacherSidebar.css";

export default function TeacherSidebar() {
const menuItems = [
    {
      name: "Dashboard",
      path: "/teacher/dashboard",
    },
    {
      name: "Profile",
      path: "/teacher/students",
    },
    {
      name: "Reports",
      path: "/teacher/reports",
    },
    {
      name: "Analytics",
      path: "/teacher/analytics",
    },
  ];

  return (
    // <aside className="teacher-sidebar">




      <aside className="student-sidebar">
        <div className="sidebar-header">
          <h2>InternTrack</h2>
          <p>Teacher Panel</p>
        </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active-link" : "sidebar-link"
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
      </aside>






      // <div className="teacher-sidebar-header">
      //   <h2>InternTrack</h2>
      //   <p>Teacher Panel</p>
      // </div>

      // <nav className="teacher-sidebar-nav">

      //   <NavLink
      //     to="/teacher/dashboard"
      //     className={({ isActive }) =>
      //       isActive
      //         ? "teacher-nav-link active"
      //         : "teacher-nav-link"
      //     }
      //   >
      //     <span>📊</span>
      //     Dashboard
      //   </NavLink>

      //   <NavLink
      //     to="/teacher/students"
      //     className={({ isActive }) =>
      //       isActive
      //         ? "teacher-nav-link active"
      //         : "teacher-nav-link"
      //     }
      //   >
      //     <span>👨‍🎓</span>
      //     Students
      //   </NavLink>

      //   {/* Future Feature */}
      //   <div className="teacher-nav-disabled">
      //     <span>📄</span>
      //     Reports
      //     <small>Coming Soon</small>
      //   </div>

      //   {/* Future Feature */}
      //   <div className="teacher-nav-disabled">
      //     <span>📈</span>
      //     Analytics
      //     <small>Coming Soon</small>
      //   </div>

      // </nav>

    // </aside>
  );
}