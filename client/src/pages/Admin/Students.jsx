import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("partially") || s === "ongoing" || s === "pending") return "badge-warning";
    if (s.includes("not") || s === "rejected") return "badge-danger";
    if (s.includes("verified") || s.includes("approved") || s === "completed") return "badge-success";
    return "badge-default";
  };

  return (
    <div className="admin-students-page">
      <div className="admin-page-header">
        <h1>All Student Lists on Portal</h1>
        <p>Manage, verify, and inspect student internships and records</p>
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((std, index) => (
                  <tr key={std._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{std.studentName}</td>
                    <td>{std.rollNumber}</td>
                    <td>{std.teacherName}</td>
                    <td>{std.managerName}</td>
                    <td>{std.totalWeeks}</td>
                    <td>
                      <span className={`status-badge ${getBadgeClass(std.internshipStatus)}`}>
                        {std.internshipStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getBadgeClass(std.verified)}`}>
                        {std.verified}
                      </span>
                    </td>
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