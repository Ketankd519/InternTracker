import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

export default function MCCertificate() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  // FETCH STUDENT CERTIFICATE
  useEffect(() => {
    fetchCertificate();
  }, [studentId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/certificates/student/${studentId}`);
      setCertificateData(response.data?.data || null);
    } catch (err) {
      console.error("Manager Certificate Fetch Error:", err);
      setError(err.response?.data?.message || "Unable to fetch certificate details.");
    } finally {
      setLoading(false);
    }
  };

  // MANAGER APPROVE CERTIFICATE
  const handleManagerApprove = async () => {
    try {
      if (!studentId) return;
      setApproving(true);
      const response = await API.put(`/certificates/${studentId}/manager-approve`);
      alert(response.data?.message || "Certificate approved successfully.");

      // Refresh certificate data
      await fetchCertificate();
    } catch (err) {
      console.error("Manager Certificate Approval Error:", err);
      alert(err.response?.data?.message || "Unable to approve certificate.");
    } finally {
      setApproving(false);
    }
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "Not Available";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Not Available";
    }
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // LOADING
  if (loading) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Internship Certificate</h2>
        <div className="certificate">
          <h2>Loading Certificate...</h2>
          <p>Please wait while certificate details are loading.</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Internship Certificate</h2>
        <div className="certificate error-card">
          <h2>Unable to Load Certificate</h2>
          <p>{error}</p>
          <button className="certificate-refresh-btn" onClick={fetchCertificate}>
            Try Again
          </button>
          <button className="teacher-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // NO DATA
  if (!certificateData) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Internship Certificate</h2>
        <div className="certificate">
          <h2>No Certificate Data</h2>
          <p>Certificate information is not available for this student.</p>
        </div>
      </div>
    );
  }

  // DATA
  const studentName = certificateData.student?.name || "Not Available";
  const companyName = certificateData.internship?.companyName || "Not Available";
  const startDate = certificateData.internship?.startDate || null;
  const endDate = certificateData.internship?.endDate || null;
  const teacherName = certificateData.certificate?.teacherName || "Teacher";
  const managerName = certificateData.certificate?.managerName || "Manager";

  const teacherVerified = certificateData.existingVerification?.teacherVerified === true;
  const managerVerified = certificateData.existingVerification?.managerVerified === true;

  const teacherApproved = certificateData.certificate?.teacherApproved === true;
  const managerApproved = certificateData.certificate?.managerApproved === true;

  const progress = Number(certificateData.progress?.percentage) || 0;
  const rawInternshipStatus = certificateData.internship?.status || certificateData.internshipStatus || "";
  const internshipStatus = rawInternshipStatus.toLowerCase();

  // REJECTION DETAILS (FROM INTERNSHIP RECORD)
  const rejectionReason =
    certificateData.internship?.rejectionReason ||
    certificateData.rejectionReason ||
    "";
  const rejectedAt =
    certificateData.internship?.rejectedAt ||
    certificateData.rejectedAt ||
    null;
  const isRejected = internshipStatus === "rejected";

  let teacherStatus = "Not Eligible";
  let managerStatus = "Not Eligible";

  if (!teacherVerified && !managerVerified) {
    teacherStatus = "Not Eligible";
    managerStatus = "Not Eligible";
  } else if (teacherVerified && !managerVerified) {
    teacherStatus = "Eligible";
    managerStatus = "Not Eligible";
  } else if (!teacherVerified && managerVerified) {
    teacherStatus = "Not Eligible";
    managerStatus = "Eligible";
  } else if (teacherVerified && managerVerified) {
    if (progress === 100) {
      teacherStatus = "Waiting for Approval";
      managerStatus = "Waiting for Approval";
    } else if (progress > 50) {
      teacherStatus = "Ongoing";
      managerStatus = "Ongoing";
    } else {
      teacherStatus = "Processing";
      managerStatus = "Processing";
    }
  }

  if (teacherApproved) {
    teacherStatus = "Approved";
  }

  if (managerApproved) {
    managerStatus = "Approved";
  }

  // STATUS CLASS
  const getStatusClass = (status) => {
    switch (status) {
      case "Approved": return "status-approved";
      case "Processing": return "status-processing";
      case "Eligible": return "status-eligible";
      case "Waiting for Approval": return "status-waiting";
      case "Ongoing": return "status-ongoing";
      case "Not Eligible":
      default: return "status-not-eligible";
    }
  };

  return (
    <div className="page active">
      {/* PAGE TITLE */}
      <h2 style={{ textAlign: "center", color: "#1e3a8a" }}>
        Student Internship Certificate
      </h2>

      {/* CERTIFICATE */}
      <div className="certificate" id="printable-certificate">
        <h1>Certificate of Internship Completion</h1>
        <p>This is to certify that</p>
        <h2>{studentName}</h2>
        <p>has successfully completed an internship at</p>
        <h2>{companyName}</h2>
        <p>Duration:</p>
        <h3>
          {formatDate(startDate)} - {formatDate(endDate)}
        </h3>
        <p>
          During this internship, the student worked on assigned projects and
          successfully completed the assigned tasks.
        </p>

        {/* VERIFICATION TABLE */}
        <table>
          <thead>
            <tr>
              <th>Verified By Teacher</th>
              <th>Verified By Manager</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{teacherName}</strong>
                <br />
                <div
                  className={`certificate-status-badge ${getStatusClass(
                    teacherStatus
                  )}`}
                >
                  {teacherStatus}
                </div>
              </td>
              <td>
                <strong>{managerName}</strong>
                <br />
                <div
                  className={`certificate-status-badge ${getStatusClass(
                    managerStatus
                  )}`}
                >
                  {managerStatus}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* INTERNSHIP INFORMATION */}
        <div className="certificate-progress">
          <p>
            <strong>Internship Progress:</strong> {progress}%
          </p>
          <p>
            <strong>Internship Status:</strong>{" "}
            <span
              style={{
                textTransform: "capitalize",
                fontWeight: "600",
                color: isRejected ? "#dc2626" : "inherit",
              }}
            >
              {rawInternshipStatus || "Not Available"}
            </span>
          </p>
        </div>

        {/* ================= RED REJECTION NOTICE (BY ADMIN) ================= */}
        {isRejected && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              background: "#fef2f2",
              border: "1.5px solid #ef4444",
              borderRadius: "8px",
              color: "#991b1b",
              textAlign: "left",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "16px" }}>❌</span>
              <strong style={{ fontSize: "14.5px" }}>
                Internship Rejected by Admin
              </strong>
            </div>
            <p style={{ margin: "4px 0", color: "#7f1d1d" }}>
              <strong>Reason:</strong> {rejectionReason || "No specific reason provided."}
            </p>
            <small style={{ color: "#b91c1c", fontSize: "12px" }}>
              <strong>Rejected Date:</strong> {formatDate(rejectedAt)}
            </small>
          </div>
        )}

        {/* MANAGER APPROVAL SECTION */}
        <div style={{ marginTop: "25px", textAlign: "center" }}>
          {isRejected ? (
            <div
              className="certificate-status-badge status-rejected"
              style={{
                display: "inline-block",
                padding: "12px 25px",
                fontSize: "15px",
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #f87171",
              }}
            >
              ✕ Cannot Approve (Internship Rejected by Admin)
            </div>
          ) : managerApproved ? (
            <div
              className="certificate-status-badge status-approved"
              style={{
                display: "inline-block",
                padding: "12px 25px",
                fontSize: "16px",
              }}
            >
              ✔ Certificate Approved by Manager
            </div>
          ) : (
            <button
              className="btn"
              onClick={handleManagerApprove}
              disabled={approving}
              style={{
                padding: "12px 28px",
                fontSize: "16px",
                cursor: approving ? "not-allowed" : "pointer",
              }}
            >
              {approving ? "Approving..." : "Approve Certificate"}
            </button>
          )}
        </div>

        {/* BACK BUTTON */}
        <button className="teacher-back-button" onClick={() => navigate(-1)}>
          ← Back to Student Certificates
        </button>
      </div>
    </div>
  );
}