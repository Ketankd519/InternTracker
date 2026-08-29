import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ManagerStyle.css";

export default function ManagerApprovals() {
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
      const response = await api.get("/manager/students");
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Manager Students Error:", error);
      setError(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed": return "manager-status-completed";
      case "ongoing": return "manager-status-ongoing";
      case "pending": return "manager-status-pending";
      case "rejected": return "manager-status-rejected";
      default: return "manager-status-default";
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
      <div className="manager-page">
        <div className="manager-loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="manager-page">
      {/* PAGE HEADER */}
      <div className="manager-page-header">
        <div>
          <h1>Student Approvals</h1>
          <p>Review student internship information and verify student records. (Showing max 10 records)</p>
        </div>
        <div className="manager-count-badge">
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

      {error && <div className="manager-error">{error}</div>}

      {/* STUDENT TABLE */}
      <div className="manager-table-container">
        <table className="manager-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Company</th>
              <th>Current Week</th>
              <th>Total Weeks</th>
              <th>Status</th>
              <th>Teacher Verification</th>
              <th>Manager Verification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.length === 0 ? (
              <tr>
                <td colSpan="10" className="manager-empty-table">
                  {searchQuery ? "No matching students found." : "No students found."}
                </td>
              </tr>
            ) : (
              displayedStudents.map((student, index) => (
                <tr key={student.studentId || student.userId}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{student.name}</strong>
                    <small className="manager-student-email">{student.email}</small>
                  </td>
                  <td>{student.rollNo || "-"}</td>
                  <td>{student.companyName}</td>
                  <td>
                    <strong>Week {student.currentWeek}</strong>
                  </td>
                  <td>{student.totalWeeks || "-"}</td>
                  <td>
                    <span className={`manager-status-badge ${getStatusClass(student.internshipStatus)}`}>
                      {student.internshipStatus}
                    </span>
                  </td>
                  <td>
                    {student.teacherVerified ? (
                      <span className="manager-verified-badge">✓ Verified</span>
                    ) : (
                      <span className="manager-not-verified-badge">Not Verified</span>
                    )}
                  </td>
                  <td>
                    {student.managerVerified ? (
                      <span className="manager-verified-badge">✓ Verified</span>
                    ) : (
                      <span className="manager-not-verified-badge">Not Verified</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="manager-view-btn"
                      onClick={() => navigate(`/manager/students/${student.studentId}`)}
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