import { NavLink } from "react-router-dom";

export default function StudentSidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: "🏠",
    },
    {
      name: "Profile",
      path: "/student/profile",
      icon: "👤",
    },
    {
      name: "Internship",
      path: "/student/internship",
      icon: "📝",
    },
    {
      name: "Weekly Report",
      path: "/student/weekly-report",
      icon: "📄",
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: "📊",
    },
    {
      name: "Certificate",
      path: "/student/certificate",
    },
  ];

  return (
    <aside className="student-sidebar">
      <div className="sidebar-header">
        <h2>Student Panel</h2>
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
  );
}