import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminViewTeacher() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Warning States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningRemark, setWarningRemark] = useState("");
  const [issuing, setIssuing] = useState(false);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/admin/teachers/${teacherId}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Error loading teacher details:", err);
      setError(err.response?.data?.message || "Failed to load teacher details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherDetails();
  }, [teacherId]);

  const handleIssueWarning = async () => {
    if (!warningRemark.trim()) {
      alert("Please enter a warning remark.");
      return;
    }
    try {
      setIssuing(true);
      await API.post(`/admin/teachers/${teacherId}/warning`, {
        remark: warningRemark,
      });
      alert("Warning issued successfully.");
      setShowWarningModal(false);
      setWarningRemark("");
      fetchTeacherDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue warning");
    } finally {
      setIssuing(false);
    }
  };

  const handleDeleteWarning = async (warningId) => {
    if (!window.confirm("Are you sure you want to remove this warning?")) return;
    try {
      await API.delete(`/admin/teachers/${teacherId}/warning/${warningId}`);
      fetchTeacherDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete warning");
    }
  };

  if (loading) {
    return (
      <div className="admin-students-page">
        <div className="admin-loading">Loading teacher profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-students-page">
        <button className="back-btn" onClick={() => navigate("/admin/teachers")}>
          ← Back to Teachers
        </button>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  const teacher = data?.teacher;
  const user = teacher?.user;
  const assignedStudents = data?.assignedStudents || [];
  const warnings = data?.warnings || [];
  const signatureUrl = getSignatureUrl(teacher?.signature);

  return (
    <div className="admin-students-page">
      <button className="back-btn" onClick={() => navigate("/admin/teachers")}>
        ← Back to Teachers
      </button>

      {/* HEADER CARD */}
      <div className="student-profile-header">
        <div className="student-profile-photo-wrapper">
          <div className="student-profile-placeholder">🧑‍🏫</div>
        </div>

        <div className="student-profile-info">
          <h1>{teacher?.name || user?.name}</h1>
          <p className="student-profile-email">{user?.email || "-"}</p>
          <div className="student-profile-meta">
            <span className="student-role-badge">Teacher</span>
            <span className="status-badge badge-default">ID: {teacher?.teacherId}</span>
            {warnings.length > 0 && (
              <span className="status-badge badge-danger">
                ⚠ {warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN DELETION & RESET AUDIT NOTICE */}
      {user?.isDeleted && user?.deletionReason && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #feb2b2",
            borderLeft: "5px solid #e53e3e",
            borderRadius: "12px",
            padding: "18px 22px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(229, 62, 62, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <h3
              style={{
                margin: 0,
                color: "#9b2c2c",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Admin Audit / Record Reset History
            </h3>
          </div>
          <p
            style={{
              margin: "0 0 8px 0",
              color: "#2d3748",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <strong>Deletion Reason:</strong> {user.deletionReason}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              color: "#718096",
              fontSize: "12.5px",
            }}
          >
            <span>
              <strong>isDeleted:</strong> {user.isDeleted ? "true (Reset by Admin)" : "false"}
            </span>
            <span>
              <strong>Deleted At:</strong>{" "}
              {user.deletedAt
                ? new Date(user.deletedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
        </div>
      )}

      {/* TEACHER DETAILS */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Teacher Details</h2>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <p>{teacher?.name || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{user?.email || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Mobile No</label>
            <p>{teacher?.mobileNo || "-"}</p>
          </div>
          <div className="detail-item">
            <label>College Name</label>
            <p>{teacher?.collegeName || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Department</label>
            <p>{teacher?.department || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Course</label>
            <p>{teacher?.course || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Experience</label>
            <p>{teacher?.experience || "-"}</p>
          </div>
        </div>
      </div>

      {/* TEACHER OFFICIAL SIGNATURE CARD */}
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
                alt={`${teacher?.name || "Teacher"} Signature`}
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
              No signature uploaded by this teacher.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNED STUDENTS (NAME-ONLY SHEET CELL TILES) */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Assigned Students ({assignedStudents.length})</h2>
        </div>
        {assignedStudents.length === 0 ? (
          <div className="empty-details">No students assigned to this teacher yet.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
              padding: "20px",
            }}
          >
            {assignedStudents.map((std) => {
              const studentName = std.user?.name || std.name || "Student";
              return (
                <div
                  key={std._id}
                  onClick={() => navigate(`/admin/students/${std._id}`)}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.background = "#eff6ff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🎓</span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1e293b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={studentName}
                  >
                    {studentName}
                  </span>
                </div>
              );
            })}
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
          <div className="empty-details">No warnings have been issued to this teacher.</div>
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
              <p>Enter the warning remark/reason for <strong>{teacher?.name}</strong>:</p>
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

// HELPER FUNCTION FOR SIGNATURE
function getSignatureUrl(signature) {
  if (!signature) return null;
  if (signature.startsWith("http://") || signature.startsWith("https://")) return signature;

  let cleanPath = signature.replace(/\\/g, "/").replace(/^\/+/, "");
  cleanPath = cleanPath.replace(/^server\/uploads\//, "").replace(/^uploads\//, "");

  return `http://localhost:5000/uploads/${cleanPath}`;
}