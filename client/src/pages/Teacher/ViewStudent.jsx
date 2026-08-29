import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TeacherStyle.css";
import api from "../../services/api";

export default function ViewStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  // FETCH STUDENT DETAILS
  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/teacher/students/${studentId}`);
      setData(response.data.student);
    } catch (error) {
      console.error("Student Details Error:", error);
      setError(error.response?.data?.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY STUDENT
  const handleVerify = async () => {
    const confirmed = window.confirm("Are you sure you want to verify this student?");
    if (!confirmed) {
      return;
    }
    try {
      setVerifying(true);
      const response = await api.put(`/teacher/students/${studentId}/verify`);
      alert(response.data?.message || "Student verified successfully.");
      await fetchStudentDetails();
    } catch (error) {
      console.error("Verification Error:", error);
      alert(error.response?.data?.message || "Failed to verify student.");
    } finally {
      setVerifying(false);
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

  // LOADING
  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">
          Loading student profile...
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="teacher-page">
        <button className="back-btn" onClick={() => navigate("/teacher/students")}>
          ← Back to Students
        </button>
        <div className="teacher-error">
          {error}
        </div>
      </div>
    );
  }

  // DATA
  const user = data?.user;
  const student = data?.student;
  const internship = data?.internship;
  const weeklyReports = data?.weeklyReports || [];

  // REJECTION STATE CHECK
  const internshipStatus = (internship?.status || "").toLowerCase();
  const isRejected = internshipStatus === "rejected";
  const rejectionReason = internship?.rejectionReason || "";
  const rejectedAt = internship?.rejectedAt || null;

  // PROFILE PHOTO
  const profilePhoto = getProfilePhotoUrl(student?.profilePhoto);

  return (
    <div className="teacher-page">
      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/teacher/students")}>
        ← Back to Students
      </button>

      {/* PROFILE HEADER */}
      <div className="student-profile-header">
        {/* Profile Photo */}
        <div className="student-profile-photo-wrapper">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={`${user?.name || "Student"} profile`}
              className="student-profile-photo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget.parentElement.querySelector(
                  ".student-profile-placeholder"
                );
                if (placeholder) {
                  placeholder.style.display = "flex";
                }
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

        {/* Profile Information */}
        <div className="student-profile-info">
          <h1>{user?.name || "Student"}</h1>
          <p className="student-profile-email">
            {user?.email || "-"}
          </p>
          <div className="student-profile-meta">
            <span className="student-role-badge">
              {user?.role || "Student"}
            </span>
            {student?.teacherVerified ? (
              <span className="verified-badge">
                ✓ Verified
              </span>
            ) : (
              <span className="not-verified-badge">
                Not Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= ADMIN DELETION & RESET AUDIT NOTICE ================= */}
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

      {/* PAGE HEADER */}
      <div className="teacher-page-header">
        <div>
          <h1>Student Profile</h1>
          <p>Complete student and internship information.</p>
        </div>
      </div>

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
                  "teacherVerified",
                  "profilePhoto",
                ].includes(key)
            )
            .map(([key, value]) => (
              <div className="detail-item" key={key}>
                <label>{formatLabel(key)}</label>
                <p>{formatValue(value, key)}</p>
              </div>
            ))}

          {/* Teacher Verification */}
          <div className="detail-item">
            <label>Teacher Verification</label>
            <p>
              {student?.teacherVerified ? (
                <span className="verified-badge">
                  ✓ Verified
                </span>
              ) : (
                <span className="not-verified-badge">
                  Not Verified
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* INTERNSHIP INFORMATION */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <h2>Internship Information</h2>
        </div>
        {!internship ? (
          <div className="empty-details">
            No internship information found.
          </div>
        ) : (
          <div>
            <div className="detail-grid">
              {Object.entries(internship)
                .filter(
                  ([key]) =>
                    ![
                      "_id",
                      "student",
                      "__v",
                      "createdAt",
                      "updatedAt",
                      "status",
                      "rejectionReason",
                      "rejectedAt",
                      "managerVerified",
                    ].includes(key)
                )
                .map(([key, value]) => (
                  <div className="detail-item" key={key}>
                    <label>{formatLabel(key)}</label>
                    <p>{formatValue(value, key)}</p>
                  </div>
                ))}

              {/* Internship Status (Custom Styled Badge) */}
              <div className="detail-item">
                <label>Internship Status</label>
                <p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "14px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      ...getInternshipStatusBadgeStyle(internship?.status),
                    }}
                  >
                    {internship?.status || "Pending"}
                  </span>
                </p>
              </div>

              {/* Manager Verification */}
              <div className="detail-item">
                <label>Manager Verification</label>
                <p>
                  {internship?.managerVerified ? (
                    <span className="verified-badge">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="not-verified-badge">
                      Not Verified
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* ================= DANGER RED REJECTION BOX (BY ADMIN) ================= */}
            {isRejected && (
              <div
                style={{
                  margin: "18px 20px 8px 20px",
                  padding: "14px 18px",
                  background: "#fef2f2",
                  border: "1.5px solid #ef4444",
                  borderRadius: "8px",
                  color: "#991b1b",
                  textAlign: "left",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: "0 1px 3px rgba(239, 68, 68, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>❌</span>
                  <strong style={{ fontSize: "14.5px" }}>
                    Internship Rejected by Admin
                  </strong>
                </div>
                <p style={{ margin: "4px 0", color: "#7f1d1d" }}>
                  <strong>Rejection Reason:</strong> {rejectionReason || "No specific reason provided."}
                </p>
                {rejectedAt && (
                  <small style={{ color: "#b91c1c", fontSize: "12px" }}>
                    <strong>Rejected Date:</strong> {formatDate(rejectedAt)}
                  </small>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* WEEKLY REPORTS */}
      <div className="teacher-detail-card">
        <div className="detail-card-header">
          <div>
            <h2>Weekly Reports</h2>
            <p className="section-description">
              Weekly internship submissions by the student.
            </p>
          </div>
        </div>
        {weeklyReports.length === 0 ? (
          <div className="empty-details">
            No weekly reports submitted yet.
          </div>
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
                      <span
                        className={`status-badge ${getReportStatusClass(
                          report.status
                        )}`}
                      >
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

      {/* TEACHER VERIFICATION */}
      <div className="teacher-verification-card">
        <div>
          <h2>Teacher Verification</h2>
          <p>
            Verify this student&apos;s profile and internship information after reviewing the submitted details.
          </p>
        </div>
        {student?.teacherVerified ? (
          <button className="verified-button" disabled>
            ✓ Student Verified
          </button>
        ) : (
          <button className="verify-button" onClick={handleVerify} disabled={verifying}>
            {verifying ? "Verifying..." : "Verify Student"}
          </button>
        )}
      </div>
    </div>
  );
}

// HELPER FUNCTIONS
function getProfilePhotoUrl(photo) {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;

  let cleanPath = photo.replace(/\\/g, "/").replace(/^\/+/, "");
  cleanPath = cleanPath.replace(/^server\/uploads\//, "").replace(/^uploads\//, "");

  if (cleanPath.startsWith("profile/")) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }
  if (cleanPath.startsWith("profilePhotos/")) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }
  return `http://localhost:5000/uploads/profile/${cleanPath}`;
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function formatValue(value = "") {
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

  if (
    attachment.includes(":\\") ||
    attachment.includes(":/") ||
    attachment.includes("\\")
  ) {
    const filename = attachment.split(/[\\/]/).pop();
    return `http://localhost:5000/uploads/reports/${filename}`;
  }

  if (attachment.startsWith("uploads/")) {
    return `http://localhost:5000/${attachment}`;
  }

  return `http://localhost:5000/uploads/reports/${attachment}`;
}