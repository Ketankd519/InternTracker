import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import "./ManagerStyle.css";

export default function ManagerViewStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // FETCH STUDENT DETAILS
  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/manager/students/${studentId}`);
      setData(response.data.student);
    } catch (error) {
      console.error("Manager Student Details Error:", error);
      setError(error.response?.data?.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY STUDENT INTERNSHIP
  const handleVerify = async () => {
    const confirmed = window.confirm("Are you sure you want to verify this student's internship?");

    if (!confirmed) {
      return;
    }
    try {
      setVerifying(true);
      await api.put(`/manager/students/${studentId}/verify`);
      alert("Student internship verified successfully.");
      await fetchStudentDetails();
    } catch (error) {
      console.error("Manager Verification Error:", error);
      alert(error.response?.data?.message || "Failed to verify student internship.");
    } finally {
      setVerifying(false);
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

  // LOADING
  if (loading) {
    return (
      <div className="manager-page">
        <div className="manager-loading">
          Loading student profile...
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="manager-page">
        <button
          className="manager-back-btn"
          onClick={() => navigate("/manager/approvals")}
        >
          ← Back to Approvals
        </button>
        <div className="manager-error">
          {error}
        </div>
      </div>
    );
  }

  // DATA
  const user = data?.user;
  const student = data?.student;
  const internship = data?.internship;

  // REJECTION STATE CHECK
  const internshipStatus = (internship?.status || "").toLowerCase();
  const isRejected = internshipStatus === "rejected";
  const rejectionReason = internship?.rejectionReason || "";
  const rejectedAt = internship?.rejectedAt || null;

  // PROFILE PHOTO
  const profilePhoto = getProfilePhotoUrl(student?.profilePhoto);

  return (
    <div className="manager-page">
      {/* BACK BUTTON */}
      <button
        className="manager-back-btn"
        onClick={() => navigate("/manager/approvals")}
      >
        ← Back to Approvals
      </button>

      {/* PROFILE HEADER */}
      <div className="manager-student-profile-header">
        {/* PROFILE PHOTO */}
        <div className="manager-student-profile-photo-wrapper">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={`${user?.name || "Student"} profile`}
              className="manager-student-profile-photo"
              onError={(e) => {
                console.error("Manager Profile Image Failed:", profilePhoto);
                e.currentTarget.style.display = "none";
                const placeholder = e.currentTarget.nextSibling;
                if (placeholder) {
                  placeholder.style.display = "flex";
                }
              }}
            />
          ) : null}

          {/* DEFAULT AVATAR */}
          <div
            className="manager-student-profile-placeholder"
            style={{
              display: profilePhoto ? "none" : "flex",
            }}
          >
            👨‍🎓
          </div>
        </div>

        {/* PROFILE INFORMATION */}
        <div className="manager-student-profile-info">
          <h1>{user?.name || "Student"}</h1>
          <p className="manager-student-profile-email">
            {user?.email || "-"}
          </p>
          <div className="manager-student-profile-meta">
            <span className="manager-student-role-badge">
              {user?.role || "Student"}
            </span>
            {internship?.managerVerified ? (
              <span className="manager-verified-badge">
                ✓ Internship Verified
              </span>
            ) : (
              <span className="manager-not-verified-badge">
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
      <div className="manager-page-header">
        <div>
          <h1>Student Profile</h1>
          <p>Review complete student and internship information.</p>
        </div>
      </div>

      {/* ACCOUNT INFORMATION */}
      <div className="manager-detail-card">
        <div className="manager-detail-header">
          <h2>Account Information</h2>
        </div>
        <div className="manager-detail-grid">
          <div className="manager-detail-item">
            <label>Name</label>
            <p>{user?.name || "-"}</p>
          </div>
          <div className="manager-detail-item">
            <label>Email</label>
            <p>{user?.email || "-"}</p>
          </div>
          <div className="manager-detail-item">
            <label>Role</label>
            <p>{user?.role || "-"}</p>
          </div>
        </div>
      </div>

      {/* STUDENT INFORMATION */}
      <div className="manager-detail-card">
        <div className="manager-detail-header">
          <h2>Student Information</h2>
        </div>
        <div className="manager-detail-grid">
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
              <div className="manager-detail-item" key={key}>
                <label>{formatLabel(key)}</label>
                <p>{formatValue(value, key)}</p>
              </div>
            ))}

          {/* Teacher Verification */}
          <div className="manager-detail-item">
            <label>Teacher Verification</label>
            <p>
              {student?.teacherVerified ? (
                <span className="manager-verified-badge">
                  ✓ Verified
                </span>
              ) : (
                <span className="manager-not-verified-badge">
                  Not Verified
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* INTERNSHIP INFORMATION */}
      <div className="manager-detail-card">
        <div className="manager-detail-header">
          <h2>Internship Information</h2>
        </div>
        {!internship ? (
          <div className="manager-empty-details">
            No internship information found.
          </div>
        ) : (
          <div>
            <div className="manager-detail-grid">
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
                  <div className="manager-detail-item" key={key}>
                    <label>{formatLabel(key)}</label>
                    <p>{formatValue(value, key)}</p>
                  </div>
                ))}

              {/* Internship Status (Custom Styled Badge) */}
              <div className="manager-detail-item">
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
              <div className="manager-detail-item">
                <label>Manager Verification</label>
                <p>
                  {internship?.managerVerified ? (
                    <span className="manager-verified-badge">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="manager-not-verified-badge">
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

      {/* MANAGER VERIFICATION */}
      <div className="manager-verification-card">
        <div>
          <h2>Manager Verification</h2>
          <p>Verify this student&apos;s internship information after reviewing the submitted details.</p>
        </div>
        {internship?.managerVerified ? (
          <button className="manager-verified-button" disabled>
            ✓ Internship Verified
          </button>
        ) : (
          <button
            className="manager-verify-button"
            onClick={handleVerify}
            disabled={verifying || !internship || isRejected}
          >
            {verifying ? "Verifying..." : "Verify Internship"}
          </button>
        )}
      </div>
    </div>
  );
}

// PROFILE PHOTO URL
function getProfilePhotoUrl(photo) {
  if (!photo) {
    return null;
  }

  let cleanPhoto = photo.replace(/\\/g, "/");

  if (
    cleanPhoto.startsWith("http://") ||
    cleanPhoto.startsWith("https://")
  ) {
    return cleanPhoto;
  }

  cleanPhoto = cleanPhoto.replace(/^\/+/, "");

  if (cleanPhoto.startsWith("uploads/")) {
    return `http://localhost:5000/${cleanPhoto}`;
  }

  if (cleanPhoto.startsWith("profile/")) {
    return `http://localhost:5000/uploads/${cleanPhoto}`;
  }

  return `http://localhost:5000/uploads/profile/${cleanPhoto}`;
}

// FORMAT LABEL
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

// FORMAT VALUE
function formatValue(value, key = "") {
  if (value === null || value === undefined) {
    return "-";
  }

  // DATE FIELDS
  if (isDateField(key, value)) {
    return formatDate(value);
  }

  // BOOLEAN
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // OBJECT / ARRAY
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return JSON.stringify(value);
  }
  return value.toString();
}

// CHECK DATE FIELD
function isDateField(key, value) {
  const dateKeys = [
    "dob",
    "dateOfBirth",
    "startDate",
    "endDate",
    "joiningDate",
    "completionDate",
    "internshipStartDate",
    "internshipEndDate",
    "submissionDate",
    "createdAt",
    "updatedAt",
    "rejectedAt",
  ];

  if (dateKeys.includes(key)) {
    return true;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return true;
  }
  return false;
}

// FORMAT DATE
function formatDate(date) {
  if (!date) {
    return "-";
  }
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}