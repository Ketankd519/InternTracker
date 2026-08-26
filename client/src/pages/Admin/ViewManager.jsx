import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminViewManager() {
  const { managerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Warning States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningRemark, setWarningRemark] = useState("");
  const [issuing, setIssuing] = useState(false);

  const fetchManagerDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/admin/managers/${managerId}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Error loading manager details:", err);
      setError(err.response?.data?.message || "Failed to load manager details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerDetails();
  }, [managerId]);

  const handleIssueWarning = async () => {
    if (!warningRemark.trim()) {
      alert("Please enter a warning remark.");
      return;
    }
    try {
      setIssuing(true);
      await API.post(`/admin/managers/${managerId}/warning`, {
        remark: warningRemark,
      });
      alert("Warning issued successfully.");
      setShowWarningModal(false);
      setWarningRemark("");
      fetchManagerDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue warning");
    } finally {
      setIssuing(false);
    }
  };

  const handleDeleteWarning = async (warningId) => {
    if (!window.confirm("Are you sure you want to remove this warning?")) return;
    try {
      await API.delete(`/admin/managers/${managerId}/warning/${warningId}`);
      fetchManagerDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete warning");
    }
  };

  if (loading) {
    return (
      <div className="admin-students-page">
        <div className="admin-loading">Loading manager profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-students-page">
        <button className="back-btn" onClick={() => navigate("/admin/managers")}>
          ← Back to Managers
        </button>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  const manager = data?.manager;
  const user = manager?.user;
  const assignedStudents = data?.assignedStudents || [];
  const warnings = data?.warnings || [];
  const signatureUrl = getSignatureUrl(manager?.signature);

  return (
    <div className="admin-students-page">
      <button className="back-btn" onClick={() => navigate("/admin/managers")}>
        ← Back to Managers
      </button>

      {/* HEADER CARD */}
      <div className="student-profile-header">
        <div className="student-profile-photo-wrapper">
          <div className="student-profile-placeholder">👨‍💼</div>
        </div>

        <div className="student-profile-info">
          <h1>{manager?.name || user?.name}</h1>
          <p className="student-profile-email">{manager?.email || user?.email || "-"}</p>
          <div className="student-profile-meta">
            <span className="student-role-badge">Manager</span>
            <span className="status-badge badge-default">ID: {manager?.managerId}</span>
            <span className="status-badge badge-default">🏢 {manager?.companyName}</span>
            {warnings.length > 0 && (
              <span className="status-badge badge-danger">
                ⚠ {warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MANAGER DETAILS */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Manager Details</h2>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <p>{manager?.name || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{manager?.email || user?.email || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Mobile No</label>
            <p>{manager?.mobileNo || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Company Name</label>
            <p>{manager?.companyName || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Experience</label>
            <p>{manager?.experience || "-"}</p>
          </div>
        </div>
      </div>

      {/* OFFICIAL SIGNATURE CARD */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Official Signature</h2>
        </div>
        <div style={{ padding: "24px" }}>
          {signatureUrl ? (
            <div
              style={{
                width: "100%",
                maxWidth: "400px",
                aspectRatio: "1599 / 662",
                border: "2px dashed #cbd5e1",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
                padding: "10px",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <img
                src={signatureUrl}
                alt={`${manager?.name || "Manager"} Signature`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const placeholder = e.currentTarget.parentElement.querySelector(".sig-err");
                  if (placeholder) placeholder.style.display = "block";
                }}
              />
              <span className="sig-err" style={{ display: "none", color: "#dc2626", fontSize: "13px" }}>
                Failed to load signature image
              </span>
            </div>
          ) : (
            <div className="empty-details" style={{ padding: "20px 0", textAlign: "left" }}>
              No signature uploaded by this manager.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNED INTERNSHIP STUDENTS */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Assigned Students / Internships ({assignedStudents.length})</h2>
        </div>
        {assignedStudents.length === 0 ? (
          <div className="empty-details">No student internships assigned to this manager yet.</div>
        ) : (
          <div className="admin-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Job Role</th>
                  <th>Duration</th>
                  <th>Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {assignedStudents.map((std, idx) => (
                  <tr key={std._id}>
                    <td>{idx + 1}</td>
                    <td className="font-semibold">{std.studentName}</td>
                    <td>{std.rollNo}</td>
                    <td>{std.jobRole}</td>
                    <td>{std.totalWeeks} Weeks</td>
                    <td>
                      <span className={`status-badge ${std.managerVerified ? "badge-success" : "badge-warning"}`}>
                        {std.managerVerified ? "Verified" : "Not Verified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WARNING SECTION */}
      <div className="teacher-detail-card">
        <div className="detail-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Admin Warnings ({warnings.length})</h2>
          <button
            className="btn-danger"
            onClick={() => setShowWarningModal(true)}
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            + Issue Warning
          </button>
        </div>

        {warnings.length === 0 ? (
          <div className="empty-details">No warnings have been issued to this manager.</div>
        ) : (
          <div className="admin-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Warning Remark</th>
                  <th>Issued Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {warnings.map((w, idx) => (
                  <tr key={w._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{w.remark}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteWarning(w._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE WARNING MODAL */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <h2>Issue Warning</h2>
              <button className="btn-close" onClick={() => setShowWarningModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Enter the warning remark/reason for <strong>{manager?.name}</strong>:</p>
              <textarea
                rows="4"
                className="form-textarea"
                placeholder="Enter warning remark here..."
                value={warningRemark}
                onChange={(e) => setWarningRemark(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={handleIssueWarning}
                disabled={issuing}
              >
                {issuing ? "Issuing..." : "Confirm Warning"}
              </button>
              <button className="btn-secondary" onClick={() => setShowWarningModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= HELPER FUNCTION FOR SIGNATURE =================
function getSignatureUrl(signature) {
  if (!signature) return null;
  if (signature.startsWith("http://") || signature.startsWith("https://")) return signature;

  let cleanPath = signature.replace(/\\/g, "/").replace(/^\/+/, "");
  cleanPath = cleanPath.replace(/^server\/uploads\//, "").replace(/^uploads\//, "");

  if (
    cleanPath.startsWith("signatures/") ||
    cleanPath.startsWith("signature/") ||
    cleanPath.startsWith("managerSignatures/")
  ) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }

  return `http://localhost:5000/uploads/${cleanPath}`;
}