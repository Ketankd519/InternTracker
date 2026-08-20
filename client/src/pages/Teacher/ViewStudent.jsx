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

  // ==========================================
  // FETCH STUDENT DETAILS
  // ==========================================

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/teacher/students/${studentId}`
      );

      setData(response.data.student);
    } catch (error) {
      console.error("Student Details Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load student details"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY STUDENT
  // ==========================================

  const handleVerify = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to verify this student?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setVerifying(true);

    console.log("Verifying student:", studentId);

    const response = await api.put(
      `/teacher/students/${studentId}/verify`
    );

    console.log("Verification Response:", response.data);

    alert(
      response.data?.message ||
        "Student verified successfully."
    );

    await fetchStudentDetails();

  } catch (error) {
    console.error("Verification Error:", error);

    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("URL:", error.config?.url);
    console.log("Method:", error.config?.method);

    alert(
      error.response?.data?.message ||
        "Failed to verify student."
    );

  } finally {
    setVerifying(false);
  }
};

function getReportStatusClass(status) {
  switch (status) {
    case "Approved":
      return "status-approved";

    case "Rejected":
      return "status-rejected";

    case "Pending":
      return "status-pending";

    default:
      return "status-default";
  }
}


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">
          Loading student profile...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="teacher-page">
        <button
          className="back-btn"
          onClick={() => navigate("/teacher/students")}
        >
          ← Back to Students
        </button>

        <div className="teacher-error">
          {error}
        </div>
      </div>
    );
  }

  // ==========================================
  // DATA
  // ==========================================

  const user = data?.user;
  const student = data?.student;
  const internship = data?.internship;
  const weeklyReports = data?.weeklyReports || [];

  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  const profilePhoto = getProfilePhotoUrl(
    student?.profilePhoto
  );

  return (
    <div className="teacher-page">

      {/* ======================================
          BACK BUTTON
      ====================================== */}

      <button
        className="back-btn"
        onClick={() => navigate("/teacher/students")}
      >
        ← Back to Students
      </button>


      {/* ======================================
          PROFILE HEADER
      ====================================== */}

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

                const placeholder =
                  e.currentTarget.parentElement.querySelector(
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
            style={{
              display: profilePhoto ? "none" : "flex",
            }}
          >
            👨‍🎓
          </div>

        </div>


        {/* Profile Information */}

        <div className="student-profile-info">

          <h1>
            {user?.name || "Student"}
          </h1>

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


      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="teacher-page-header">

        <div>
          <h1>Student Profile</h1>

          <p>
            Complete student and internship information.
          </p>
        </div>

      </div>


      {/* ======================================
          ACCOUNT INFORMATION
      ====================================== */}

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


      {/* ======================================
          STUDENT INFORMATION
      ====================================== */}

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
              <div
                className="detail-item"
                key={key}
              >
                <label>
                  {formatLabel(key)}
                </label>

                <p>
                  {formatValue(value, key)}
                </p>
              </div>
            ))}


          {/* Teacher Verification */}

          <div className="detail-item">

            <label>
              Teacher Verification
            </label>

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


      {/* ======================================
          INTERNSHIP INFORMATION
      ====================================== */}

      <div className="teacher-detail-card">

        <div className="detail-card-header">

          <h2>Internship Information</h2>

        </div>


        {!internship ? (

          <div className="empty-details">
            No internship information found.
          </div>

        ) : (

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
                  ].includes(key)
              )
              .map(([key, value]) => (

                <div
                  className="detail-item"
                  key={key}
                >

                  <label>
                    {formatLabel(key)}
                  </label>

                  <p>
                    {formatValue(value, key)}
                  </p>

                </div>

              ))}

              {/* Manager Verification */}

          <div className="detail-item">

            <label>
              Manager Verification
            </label>

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

        )}

      </div>


      {/* ======================================
          WEEKLY REPORTS
      ====================================== */}

      <div className="teacher-detail-card">

        <div className="detail-card-header">

          <div>

            <h2>
              Weekly Reports
            </h2>

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

                  <th>
                    Submission Date
                  </th>

                  <th>
                    Week
                  </th>

                  <th>
                    Task Title
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Attachment
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {weeklyReports.map((report) => (

                  <tr key={report._id}>

                    <td>
                      {formatDate(
                        report.submissionDate ||
                          report.createdAt
                      )}
                    </td>

                    <td>
                      Week {report.weekNumber || "-"}
                    </td>

                    <td>
                      {report.taskTitle || "-"}
                    </td>

                    <td className="report-description">
                      {report.description || "-"}
                    </td>

                    <td>

                      {report.attachment ? (

                        <a
                          href={getAttachmentUrl(
                            report.attachment
                          )}
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


      {/* ======================================
          TEACHER VERIFICATION
      ====================================== */}

      <div className="teacher-verification-card">

        <div>

          <h2>
            Teacher Verification
          </h2>

          <p>
            Verify this student's profile and internship
            information after reviewing the submitted details.
          </p>

        </div>


        {student?.teacherVerified ? (

          <button
            className="verified-button"
            disabled
          >
            ✓ Student Verified
          </button>

        ) : (

          <button
            className="verify-button"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying
              ? "Verifying..."
              : "Verify Student"}
          </button>

        )}

      </div>

    </div>
  );
}


/* =====================================================
   HELPER FUNCTIONS
===================================================== */


/* PROFILE PHOTO URL */

function getProfilePhotoUrl(photo) {
  if (!photo) {
    return null;
  }

  // Already a complete URL
  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://")
  ) {
    return photo;
  }

  // Normalize Windows paths
  let cleanPath = photo
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  // Remove unnecessary prefixes
  cleanPath = cleanPath
    .replace(/^server\/uploads\//, "")
    .replace(/^uploads\//, "");

  // If database contains:
  // profile/filename.jpg
  if (cleanPath.startsWith("profile/")) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }

  // If database contains:
  // profilePhotos/filename.jpg
  if (cleanPath.startsWith("profilePhotos/")) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }

  // If database contains only:
  // filename.jpg
  return `http://localhost:5000/uploads/profile/${cleanPath}`;
}

/* FORMAT LABEL */

function formatLabel(key) {

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) =>
      str.toUpperCase()
    );
}


/* FORMAT VALUE */

function formatValue(value, key = "") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return JSON.stringify(value);
  }

  const stringValue = value.toString();

  // Convert ISO date to YYYY-MM-DD
  // Example:
  // 2003-09-04T00:00:00.000Z
  // becomes:
  // 2003-09-04
  if (
    /^\d{4}-\d{2}-\d{2}T/.test(stringValue)
  ) {
    return stringValue.substring(0, 10);
  }

  return stringValue;
}


/* FORMAT DATE */

function formatDate(date) {

  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


/* ATTACHMENT URL */

function getAttachmentUrl(attachment) {

  if (!attachment) {
    return "#";
  }

  // Already a complete URL
  if (
    attachment.startsWith("http://") ||
    attachment.startsWith("https://")
  ) {
    return attachment;
  }

  // Handle old Windows filesystem paths
  if (
    attachment.includes(":\\") ||
    attachment.includes(":/") ||
    attachment.includes("\\")
  ) {
    const filename = attachment.split(/[\\/]/).pop();

    return `http://localhost:5000/uploads/reports/${filename}`;
  }

  // New database format:
  // uploads/reports/filename.pdf
  if (attachment.startsWith("uploads/")) {
    return `http://localhost:5000/${attachment}`;
  }

  // If database contains only the filename
  return `http://localhost:5000/uploads/reports/${attachment}`;
}