import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./TeacherStyle.css";

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teacher/students");
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Students Error:", error);
      setError(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed": return "status-completed";
      case "ongoing": return "status-ongoing";
      case "pending": return "status-pending";
      case "rejected": return "status-rejected";
      default: return "status-default";
    }
  };

  // SEARCH FILTER
  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      student.name?.toLowerCase().includes(q) ||
      student.email?.toLowerCase().includes(q) ||
      student.rollNo?.toLowerCase().includes(q) ||
      student.companyName?.toLowerCase().includes(q) ||
      student.internshipStatus?.toLowerCase().includes(q)
    );
  });

  // DISPLAY LIMIT: Maximum 10 items shown
  const displayedStudents = filteredStudents.slice(0, 10);

  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="teacher-page">
      {/* Header */}
      <div className="teacher-page-header">
        <div>
          <h1>Students</h1>
          <p>View assigned students and their internship progress. (Showing max 10 records)</p>
        </div>
        <div className="student-count-badge">
          {students.length} Total Students
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by student name, roll no, company, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        />
        {searchQuery && (
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Found {filteredStudents.length} match{filteredStudents.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {error && <div className="teacher-error">{error}</div>}

      {/* Table */}
      <div className="teacher-table-container">
        <table className="teacher-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Company</th>
              <th>Current Week</th>
              <th>Total Weeks</th>
              <th>Status</th>
              <th>Manager Verification</th>
              <th>Teacher Verification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-table">
                  {searchQuery ? "No matching students found." : "No students found."}
                </td>
              </tr>
            ) : (
              displayedStudents.map((student, index) => (
                <tr key={student.studentId || student.userId}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{student.name}</strong>
                    <small className="student-email">{student.email}</small>
                  </td>
                  <td>
                    <strong>{student.rollNo || "-"}</strong>
                  </td>
                  <td>{student.companyName}</td>
                  <td>
                    <strong>Week {student.currentWeek}</strong>
                  </td>
                  <td>{student.totalWeeks || "-"}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(student.internshipStatus)}`}>
                      {student.internshipStatus}
                    </span>
                  </td>
                  <td>
                    {student.managerVerified ? (
                      <span className="verified-badge">✓ Verified</span>
                    ) : (
                      <span className="not-verified-badge">Not Verified</span>
                    )}
                  </td>
                  <td>
                    {student.teacherVerified ? (
                      <span className="verified-badge">✓ Verified</span>
                    ) : (
                      <span className="not-verified-badge">Not Verified</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="view-student-btn"
                      onClick={() => navigate(`/teacher/students/${student.studentId}`)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}