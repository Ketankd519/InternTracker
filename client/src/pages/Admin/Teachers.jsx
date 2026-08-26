import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="admin-students-page">
      <div className="admin-page-header">
        <h1>All Teacher Lists on Portal</h1>
        <p>Monitor college teachers, verified students, approvals, and issue warnings</p>
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
                <th>Total Assigned Students</th>
                <th>Total Students Verified by Teacher</th>
                <th>Total Students Approved by Teacher</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                    No teachers found.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, index) => (
                  <tr key={teacher._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{teacher.teacherName}</td>
                    <td>{teacher.teacherId}</td>
                    <td>{teacher.collegeName}</td>
                    <td>
                      <span className="status-badge badge-default">
                        {teacher.totalAssignedStudents}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {teacher.totalVerifiedStudents}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {teacher.totalApprovedStudents}
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