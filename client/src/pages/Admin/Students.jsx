import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/students");
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Error loading students:", err);
      setError(err.response?.data?.message || "Failed to load students list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteReason.trim()) {
      alert("Please enter a reason for deletion.");
      return;
    }
    try {
      setDeleting(true);
      await API.delete(`/admin/students/${studentToDelete._id}`, {
        data: { deletionReason: deleteReason },
      });
      alert("Student deleted successfully.");
      setShowDeleteModal(false);
      setStudentToDelete(null);
      setDeleteReason("");
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  // Specific color badge for Internship Status (pending=yellow, ongoing=blue, completed=green, rejected=red)
  const getInternshipStatusBadgeStyle = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "pending") {
      return {
        background: "#fef9c3",
        color: "#854d0e",
        border: "1px solid #fde047",
      };
    }
    if (s === "ongoing") {
      return {
        background: "#e0f2fe",
        color: "#0369a1",
        border: "1px solid #7dd3fc",
      };
    }
    if (s === "completed") {
      return {
        background: "#dcfce7",
        color: "#15803d",
        border: "1px solid #86efac",
      };
    }
    if (s === "rejected") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
      };
    }
    return {
      background: "#f1f5f9",
      color: "#475569",
      border: "1px solid #cbd5e1",
    };
  };

  // Badge class for Verified / Approved general statuses
  const getBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("partially") || s === "pending") return "badge-warning";
    if (s.includes("not") || s === "rejected") return "badge-danger";
    if (s.includes("verified") || s.includes("approved") || s === "completed") return "badge-success";
    return "badge-default";
  };

  // SEARCH FILTER
  const filteredStudents = students.filter((std) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      std.studentName?.toLowerCase().includes(q) ||
      std.rollNumber?.toLowerCase().includes(q) ||
      std.teacherName?.toLowerCase().includes(q) ||
      std.managerName?.toLowerCase().includes(q) ||
      std.internshipStatus?.toLowerCase().includes(q) ||
      std.verified?.toLowerCase().includes(q) ||
      std.approved?.toLowerCase().includes(q)
    );
  });

  // DISPLAY LIMIT: Max 20 students shown in frame
  const displayedStudents = filteredStudents.slice(0, 20);

  return (
    <div className="admin-students-page">
      {/* PAGE HEADER WITH TOP-RIGHT STUDENT COUNT */}
      <div
        className="admin-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#1e293b" }}>
            All Student Lists on Portal
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Manage, verify, and inspect student internships and records (Showing max 20 records)
          </p>
        </div>

        {/* TOP RIGHT TOTAL STUDENTS BADGE */}
        <div
          style={{
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            padding: "8px 16px",
            borderRadius: "20px",
            fontWeight: "700",
            fontSize: "14px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Total Students: {students.length}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div
        style={{
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by student name, roll number, teacher, manager, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "440px",
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

      {loading && <div className="admin-loading">Loading students list...</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && !error && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Teacher Name</th>
                <th>Manager Name</th>
                <th>Total Weeks</th>
                <th>Internship Status</th>
                <th>Student Verified</th>
                <th>Certificate Approved</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    {searchQuery ? "No matching students found." : "No students found."}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((std, index) => (
                  <tr key={std._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{std.studentName}</td>
                    <td>{std.rollNumber}</td>
                    <td>{std.teacherName}</td>
                    <td>{std.managerName}</td>
                    <td>{std.totalWeeks}</td>
                    
                    {/* CUSTOM COLORED INTERNSHIP STATUS BADGE */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "14px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "capitalize",
                          ...getInternshipStatusBadgeStyle(std.internshipStatus),
                        }}
                      >
                        {std.internshipStatus}
                      </span>
                    </td>

                    {/* STUDENT VERIFIED */}
                    <td>
                      <span className={`status-badge ${getBadgeClass(std.verified)}`}>
                        {std.verified}
                      </span>
                    </td>

                    {/* CERTIFICATE APPROVED */}
                    <td>
                      <span className={`status-badge ${getBadgeClass(std.approved)}`}>
                        {std.approved}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/admin/students/${std._id}`)}
                      >
                        View Profile
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          setStudentToDelete(std);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete <strong>{studentToDelete?.studentName}</strong>?
              </p>
              <label><strong>Reason for Deletion:</strong></label>
              <textarea
                rows="3"
                className="form-textarea"
                placeholder="Enter deletion audit reason..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}