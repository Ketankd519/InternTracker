import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminManagers() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/managers");
      setManagers(res.data.data || []);
    } catch (err) {
      console.error("Error loading managers:", err);
      setError(err.response?.data?.message || "Failed to load managers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteReason.trim()) {
      alert("Please provide a reason for deletion.");
      return;
    }
    try {
      setDeleting(true);
      await API.delete(`/admin/managers/${managerToDelete._id}`, {
        data: { deletionReason: deleteReason },
      });
      alert("Manager deleted successfully.");
      setShowDeleteModal(false);
      setManagerToDelete(null);
      setDeleteReason("");
      fetchManagers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete manager");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-students-page">
      <div className="admin-page-header">
        <h1>All Manager Lists on Portal</h1>
        <p>Monitor industry managers, company internships, approvals, and issue warnings</p>
      </div>

      {loading && <div className="admin-loading">Loading managers list...</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && !error && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Manager Name</th>
                <th>Manager ID</th>
                <th>Company Name</th>
                <th>Total Assigned Students</th>
                <th>Total Students Verified by Manager</th>
                <th>Total Students Approved by Manager</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                    No managers found.
                  </td>
                </tr>
              ) : (
                managers.map((mgr, index) => (
                  <tr key={mgr._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{mgr.managerName}</td>
                    <td>{mgr.managerId}</td>
                    <td>{mgr.companyName}</td>
                    <td>
                      <span className="status-badge badge-default">
                        {mgr.totalAssignedStudents}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {mgr.totalVerifiedStudents}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {mgr.totalApprovedStudents}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/admin/managers/${mgr._id}`)}
                      >
                        View Profile
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          setManagerToDelete(mgr);
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
                Are you sure you want to delete manager <strong>{managerToDelete?.managerName}</strong>?
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