import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherStyle.css";
import api from "../../services/api";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
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
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-page">
        <div className="teacher-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-page">

      {/* Welcome */}
      <div className="teacher-welcome">
        <div>
          <h1>Welcome, {teacher?.name || "Teacher"} 👋 </h1>
          <p>Here is an overview of your students and internships.</p>
        </div>
      </div>

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
          <button onClick={() => navigate("/teacher/students")}
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