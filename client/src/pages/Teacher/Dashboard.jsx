import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherStyle.css";
import api from "../../services/api";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    assignedStudents: 0,
    completedAssignedStudents: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teacher/dashboard");
      setTeacher(response.data.teacher);
      setWarnings(response.data.teacher?.warnings || []);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissWarning = async (warningId) => {
    if (!window.confirm("Are you sure you want to dismiss this warning?")) return;
    try {
      await api.delete(`/teacher/warnings/${warningId}`);
      setWarnings((prev) => prev.filter((w) => w._id !== warningId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to dismiss warning");
    }
  };

  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-page">
        <div className="teacher-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="teacher-page">
      {/* Welcome */}
      <div className="teacher-welcome">
        <div>
          <h1>Welcome, {teacher?.name || "Teacher"} 👋</h1>
          <p>Here is an overview of your students and internships.</p>
        </div>
      </div>

      {/* ================= ADMIN DELETION / RESET NOTICE BANNER ================= */}
      {teacher?.isDeleted && teacher?.deletionReason && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fed7d7",
            borderLeft: "5px solid #e53e3e",
            borderRadius: "12px",
            padding: "18px 22px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(229, 62, 62, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <h3
              style={{
                margin: 0,
                color: "#9b2c2c",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Account / Profile Reset Notice
            </h3>
          </div>
          <p
            style={{
              margin: "0 0 6px 0",
              color: "#2d3748",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <strong>Admin Reason:</strong> {teacher.deletionReason}
          </p>
          <small style={{ color: "#718096", fontSize: "12.5px" }}>
            Your teacher profile details were reset by the portal administrator. Please set up your profile again from the Profile section.
          </small>
        </div>
      )}

      {/* ================= ADMIN WARNINGS SECTION ================= */}
      {warnings.length > 0 && (
        <div className="teacher-warning-banner">
          <div className="warning-banner-header">
            <h3>⚠️ Admin Notices & Warnings ({warnings.length})</h3>
            <p>Please review and acknowledge the remarks below issued by the Portal Administrator.</p>
          </div>
          <div className="warning-list">
            {warnings.map((item) => (
              <div key={item._id} className="warning-item">
                <div className="warning-item-content">
                  <p className="warning-remark">{item.remark}</p>
                  <small className="warning-date">
                    Issued on: {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </small>
                </div>
                <button
                  className="btn-dismiss-warning"
                  onClick={() => handleDismissWarning(item._id)}
                >
                  ✕ Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="teacher-stat-grid">
        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">👨‍🎓</div>
          <div>
            <p>Total Students on portal</p>
            <h2>{statistics.totalStudents}</h2>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">📚</div>
          <div>
            <p>Active Students on portal</p>
            <h2>{statistics.activeStudents}</h2>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">✅</div>
          <div>
            <p>Completed student on portal</p>
            <h2>{statistics.completedStudents}</h2>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">🙋‍♀️</div>
          <div>
            <p>Students Assigned {teacher?.name || "Teacher"}</p>
            <h2>{statistics.assignedStudents}</h2>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">✅</div>
          <div>
            <p>Completed student of {teacher?.name || "Teacher"}</p>
            <h2>{statistics.completedAssignedStudents}</h2>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="teacher-section">
        <div className="teacher-section-header">
          <h2>Quick Access</h2>
        </div>
        <div className="teacher-quick-grid">
          <button
            onClick={() => navigate("/teacher/students")}
            className="teacher-quick-card"
          >
            <span>👨‍🎓</span>
            <div>
              <h3>View Students</h3>
              <p>View student profiles and internship progress.</p>
            </div>
          </button>

          <div className="teacher-quick-card disabled">
            <span>📄</span>
            <div>
              <h3>Reports</h3>
              <p>Reports module will be available in a future update.</p>
            </div>
          </div>

          <div className="teacher-quick-card disabled">
            <span>📈</span>
            <div>
              <h3>Analytics</h3>
              <p>Analytics module will be available in a future update.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}