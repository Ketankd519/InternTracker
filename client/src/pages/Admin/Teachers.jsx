import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/teachers");
      setTeachers(res.data.data || []);
    } catch (err) {
      console.error("Error loading teachers:", err);
      setError(err.response?.data?.message || "Failed to load teachers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteReason.trim()) {
      alert("Please provide a reason for deletion.");
      return;
    }
    try {
      setDeleting(true);
      await API.delete(`/admin/teachers/${teacherToDelete._id}`, {
        data: { deletionReason: deleteReason },
      });
      alert("Teacher deleted successfully.");
      setShowDeleteModal(false);
      setTeacherToDelete(null);
      setDeleteReason("");
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete teacher");
    } finally {
      setDeleting(false);
    }
  };

  // SEARCH FILTER
  const filteredTeachers = teachers.filter((teacher) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      teacher.teacherName?.toLowerCase().includes(q) ||
      teacher.teacherId?.toLowerCase().includes(q) ||
      teacher.collegeName?.toLowerCase().includes(q) ||
      teacher.department?.toLowerCase().includes(q) ||
      teacher.course?.toLowerCase().includes(q)
    );
  });

  // DISPLAY LIMIT: Maximum 10 teachers shown
  const displayedTeachers = filteredTeachers.slice(0, 10);

  return (
    <div className="admin-students-page">
      {/* PAGE HEADER WITH TOP-RIGHT TEACHER COUNT */}
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
            All Teacher Lists on Portal
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Monitor college teachers, verified students, approvals, and issue warnings (Showing max 10 records)
          </p>
        </div>

        {/* TOP RIGHT TOTAL TEACHERS BADGE */}
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
          Total Teachers: {teachers.length}
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
          placeholder="Search by teacher name, teacher ID, college, department..."
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
            Found {filteredTeachers.length} match{filteredTeachers.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {loading && <div className="admin-loading">Loading teachers list...</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && !error && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Teacher Name</th>
                <th>Teacher ID</th>
                <th>College Name</th>
                <th>Assigned Students</th>
                <th>Students Verified</th>
                <th>Certificate Approved</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {displayedTeachers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    {searchQuery ? "No matching teachers found." : "No teachers found."}
                  </td>
                </tr>
              ) : (
                displayedTeachers.map((teacher, index) => (
                  <tr key={teacher._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{teacher.teacherName}</td>
                    <td>{teacher.teacherId}</td>
                    <td>{teacher.collegeName}</td>
                    <td>
                      <span className="status-badge badge-default">
                        {teacher.totalAssignedStudents ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {teacher.totalVerifiedStudents ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {teacher.totalApprovedStudents ?? 0}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/admin/teachers/${teacher._id}`)}
                      >
                        View Profile
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          setTeacherToDelete(teacher);
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete teacher <strong>{teacherToDelete?.teacherName}</strong>?
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