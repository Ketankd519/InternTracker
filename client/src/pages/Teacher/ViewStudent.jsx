import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../pages/Teacher/TeacherStyle.css";
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


  const fetchStudentDetails = async () => {
    try {

      setLoading(true);

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


  const handleVerify = async () => {

    const confirmed = window.confirm(
      "Are you sure you want to verify this student?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setVerifying(true);

      await api.put(
        `/teacher/students/${studentId}/verify`
      );

      alert("Student verified successfully.");

      await fetchStudentDetails();

    } catch (error) {

      console.error("Verification Error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to verify student."
      );

    } finally {

      setVerifying(false);

    }
  };


  if (loading) {

    return (
      <div className="teacher-page">
        <div className="teacher-loading">
          Loading student profile...
        </div>
      </div>
    );

  }


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


  const user = data?.user;
  const student = data?.student;
  const internship = data?.internship;
  const weeklyReports = data?.weeklyReports || [];


  return (
    <div className="teacher-page">

      {/* Back */}
      <button
        className="back-btn"
        onClick={() => navigate("/teacher/students")}
      >
        ← Back to Students
      </button>


      {/* Page Header */}
      <div className="teacher-page-header">

        <div>

          <h1>
            Student Profile
          </h1>

          <p>
            Complete student and internship information.
          </p>

        </div>

      </div>


      {/* =====================================
          USER INFORMATION
      ===================================== */}

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


      {/* =====================================
          STUDENT INFORMATION
      ===================================== */}

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
                  {formatValue(value)}
                </p>

              </div>

            ))}

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


      {/* =====================================
          INTERNSHIP
      ===================================== */}

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
                    {formatValue(value)}
                  </p>

                </div>

              ))}

          </div>

        )}

      </div>


      {/* =====================================
          WEEKLY REPORTS
      ===================================== */}

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

                    <td>
                      {formatDate(
                        report.submissionDate ||
                        report.createdAt
                      )}
                    </td>

                    <td>
                      Week {report.weekNumber}
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

                      <span className="status-badge status-default">
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


      {/* =====================================
          TEACHER VERIFICATION
      ===================================== */}

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


/*
====================================================
HELPER FUNCTIONS
====================================================
*/

function formatLabel(key) {

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

}


function formatValue(value) {

  if (value === null || value === undefined) {
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

  return value.toString();

}


function formatDate(date) {

  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

}


function getAttachmentUrl(attachment) {

  if (!attachment) {
    return "#";
  }

  // If attachment is already a complete URL
  if (
    attachment.startsWith("http://") ||
    attachment.startsWith("https://")
  ) {
    return attachment;
  }

  // Existing backend uploads
  return `http://localhost:5000/uploads/${attachment}`;
}