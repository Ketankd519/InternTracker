import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminManagers() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  // SEARCH FILTER
  const filteredManagers = managers.filter((mgr) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      mgr.managerName?.toLowerCase().includes(q) ||
      mgr.managerId?.toLowerCase().includes(q) ||
      mgr.companyName?.toLowerCase().includes(q)
    );
  });

  // DISPLAY LIMIT: Maximum 10 managers shown
  const displayedManagers = filteredManagers.slice(0, 10);

  return (
    <div className="admin-students-page">
      {/* PAGE HEADER WITH TOP-RIGHT MANAGER COUNT */}
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
            All Manager Lists on Portal
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Monitor industry managers, company internships, approvals, and issue warnings (Showing max 10 records)
          </p>
        </div>

        {/* TOP RIGHT TOTAL MANAGERS BADGE */}
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
          Total Managers: {managers.length}
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
          placeholder="Search by manager name, manager ID, company name..."
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
            Found {filteredManagers.length} match{filteredManagers.length === 1 ? "" : "es"}
          </span>
        )}
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
                <th>Assigned Students</th>
                <th>Students Verified</th>
                <th>Certificate Approved</th>
                <th>Action</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {displayedManagers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    {searchQuery ? "No matching managers found." : "No managers found."}
                  </td>
                </tr>
              ) : (
                displayedManagers.map((mgr, index) => (
                  <tr key={mgr._id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold">{mgr.managerName}</td>
                    <td>{mgr.managerId}</td>
                    <td>{mgr.companyName}</td>
                    <td>
                      <span className="status-badge badge-default">
                        {mgr.totalAssignedStudents ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {mgr.totalVerifiedStudents ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-success">
                        {mgr.totalApprovedStudents ?? 0}
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