import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminViewStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rejection State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/admin/students/${studentId}`);
      setData(response.data.student);
    } catch (err) {
      console.error("Admin Student Details Error:", err);
      setError(err.response?.data?.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection remark/reason.");
      return;
    }
    try {
      setRejecting(true);
      const res = await API.put(`/admin/students/${studentId}/reject`, {
        rejectionReason: rejectReason,
      });
      alert(res.data?.message || "Internship successfully rejected.");
      setShowRejectModal(false);
      setRejectReason("");
      await fetchStudentDetails();
    } catch (err) {
      console.error("Rejection Error:", err);
      alert(err.response?.data?.message || "Failed to reject internship.");
    } finally {
      setRejecting(false);
    }
  };

  function getReportStatusClass(status) {
    switch (status) {
      case "Approved": return "status-approved";
      case "Rejected": return "status-rejected";
      case "Pending": return "status-pending";
      default: return "status-default";
    }
  }

  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">Loading student profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-page">
        <button className="back-btn" onClick={() => navigate("/admin/students")}>
          ← Back to Students
        </button>
        <div className="teacher-error">{error}</div>
      </div>
    );
  }

  const user = data?.user;
  const student = data?.student;
  const internship = data?.internship;
  const weeklyReports = data?.weeklyReports || [];
  const profilePhoto = getProfilePhotoUrl(student?.profilePhoto);

  return (
    <div className="teacher-page" style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/admin/students")}>
        ← Back to Students
      </button>

      {/* PROFILE HEADER */}
      <div className="student-profile-header">
        <div className="student-profile-photo-wrapper">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={`${user?.name || "Student"} profile`}
              className="student-profile-photo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget.parentElement.querySelector(".student-profile-placeholder");
                if (placeholder) placeholder.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="student-profile-placeholder"
            style={{ display: profilePhoto ? "none" : "flex" }}
          >
            👨‍🎓
          </div>
        </div>

        <div className="student-profile-info">
          <h1>{user?.name || "Student"}</h1>
          <p className="student-profile-email">{user?.email || "-"}</p>
          <div className="student-profile-meta">
            <span className="student-role-badge">{user?.role || "Student"}</span>
            {student?.teacherVerified ? (
              <span className="verified-badge">✓ Teacher Verified</span>
            ) : (
              <span className="not-verified-badge">Teacher Not Verified</span>
            )}
            {internship?.managerVerified ? (
              <span className="verified-badge">✓ Manager Verified</span>
            ) : (
              <span className="not-verified-badge">Manager Not Verified</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= ADMIN DELETION AUDIT NOTICE ================= */}
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

      {/* ACCOUNT INFORMATION */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Account Information</h2>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <p>{user?.name || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{user?.email || "-"}</p>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <p>{user?.role || "-"}</p>
          </div>
        </div>
      </div>

      {/* STUDENT INFORMATION */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Student Information</h2>
        </div>
        <div className="detail-grid">
          {Object.entries(student || {})
            .filter(
              ([key]) =>
                ![
                  "_id",
                  "user",
                  "__v",
                  "createdAt",
                  "updatedAt",
                  "profilePhoto",
                ].includes(key)
            )
            .map(([key, value]) => (
              <div className="detail-item" key={key}>
                <label>{formatLabel(key)}</label>
                <p>{formatValue(value)}</p>
              </div>
            ))}
        </div>
      </div>

      {/* INTERNSHIP INFORMATION */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Internship Information</h2>
        </div>
        {!internship ? (
          <div className="empty-details">No internship information found.</div>
        ) : (
          <div className="detail-grid">
            {Object.entries(internship)
              .filter(
                ([key]) =>
                  ![
                    "_id",
                    "student",
                    "studentId",
                    "user",
                    "userId",
                    "__v",
                    "createdAt",
                    "updatedAt",
                  ].includes(key)
              )
              .map(([key, value]) => (
                <div className="detail-item" key={key}>
                  <label>{formatLabel(key)}</label>
                  <p>{formatValue(value)}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* WEEKLY REPORTS */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <div>
            <h2>Weekly Reports</h2>
            <p className="section-description">Weekly submissions by the student.</p>
          </div>
        </div>
        {weeklyReports.length === 0 ? (
          <div className="empty-details">No weekly reports submitted yet.</div>
        ) : (
          <div className="teacher-table-container">
            <table className="teacher-table weekly-report-table">
              <thead>
                <tr>
                  <th>Submission Date</th>
                  <th>Week</th>
                  <th>Task Title</th>
                  <th>Description</th>
                  <th>Attachment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklyReports.map((report) => (
                  <tr key={report._id}>
                    <td>{formatDate(report.submissionDate || report.createdAt)}</td>
                    <td>Week {report.weekNumber || "-"}</td>
                    <td>{report.taskTitle || "-"}</td>
                    <td className="report-description">{report.description || "-"}</td>
                    <td>
                      {report.attachment ? (
                        <a
                          href={getAttachmentUrl(report.attachment)}
                          target="_blank"
                          rel="noreferrer"
                          className="attachment-link"
                        >
                          View Attachment
                        </a>
                      ) : (
                        "No Attachment"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${getReportStatusClass(report.status)}`}>
                        {report.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADMIN ACTIONS: REJECT INTERNSHIP */}
      <div className="teacher-verification-card" style={{ borderLeft: "4px solid #dc2626" }}>
        <div>
          <h2>Reject Internship</h2>
          <p>
            Reject the student&apos;s current internship record. A remark/reason will be saved with the record.
          </p>
        </div>
        {internship?.status === "rejected" ? (
          <button className="status-badge status-rejected" style={{ padding: "10px 18px", fontSize: "14px" }} disabled>
            Internship Rejected
          </button>
        ) : (
          <button
            className="btn-danger"
            style={{ padding: "12px 22px", fontSize: "14px", fontWeight: "600", borderRadius: "8px" }}
            onClick={() => setShowRejectModal(true)}
          >
            Reject Internship
          </button>
        )}
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-sm">
            <div className="modal-header">
              <h2>Reject Internship</h2>
              <button className="btn-close" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Please enter the reason/remark for rejecting this internship:</p>
              <textarea
                rows="4"
                className="form-textarea"
                placeholder="Enter rejection reason here..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={handleConfirmReject}
                disabled={rejecting}
              >
                {rejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= HELPER FUNCTIONS =================
function getProfilePhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;

  let cleanPath = photo.replace(/\\/g, "/").replace(/^\/+/, "");
  cleanPath = cleanPath.replace(/^server\/uploads\//, "").replace(/^uploads\//, "");

  if (cleanPath.startsWith("profile/") || cleanPath.startsWith("profilePhotos/")) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }
  return `http://localhost:5000/uploads/profile/${cleanPath}`;
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.join(", ");
    return JSON.stringify(value);
  }
  const stringValue = value.toString();
  if (/^\d{4}-\d{2}-\d{2}T/.test(stringValue)) {
    return stringValue.substring(0, 10);
  }
  return stringValue;
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAttachmentUrl(attachment) {
  if (!attachment) return "#";
  if (attachment.startsWith("http://") || attachment.startsWith("https://")) return attachment;

  if (attachment.includes(":\\") || attachment.includes(":/") || attachment.includes("\\")) {
    const filename = attachment.split(/[\\/]/).pop();
    return `http://localhost:5000/uploads/reports/${filename}`;
  }
  if (attachment.startsWith("uploads/")) {
    return `http://localhost:5000/${attachment}`;
  }
  return `http://localhost:5000/uploads/reports/${attachment}`;
}