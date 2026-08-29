import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function SSCertificate() {
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificateStatus();
  }, []);

  const fetchCertificateStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/certificates/status");
      setCertificateData(response.data?.data || {});
    } catch (err) {
      console.error("Certificate Status Error:", err);
      console.error(err.response?.data?.message || "Unable to fetch certificate status.");
      setCertificateData({});
    } finally {
      setLoading(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="certificate-status-page">
        <div className="certificate-status-card">
          <h2>Certificate Status</h2>
          <p>Loading certificate details...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error && !certificateData) {
    return (
      <div className="certificate-status-page">
        <div className="certificate-status-card error-card">
          <h2>Certificate Status</h2>
          <p>{error}</p>
          <button
            className="certificate-refresh-btn"
            onClick={fetchCertificateStatus}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="certificate-status-page">
        <div className="certificate-status-card">
          <h2>Certificate Status</h2>
          <p>No certificate information available.</p>
        </div>
      </div>
    );
  }

  // DATA
  const studentName = certificateData.student?.name || "Not Available";
  const companyName = certificateData.internship?.companyName || "Not Available";
  const startDate = certificateData.internship?.startDate || null;
  const endDate = certificateData.internship?.endDate || null;
  const teacherName = certificateData.certificate?.teacherName || "Teacher Name";
  const managerName = certificateData.certificate?.managerName || "Manager Name";

  // Existing verification
  const teacherVerified = certificateData.existingVerification?.teacherVerified === true;
  const managerVerified = certificateData.existingVerification?.managerVerified === true;

  // Certificate approval
  const teacherApproved = certificateData.certificate?.teacherApproved === true;
  const managerApproved = certificateData.certificate?.managerApproved === true;

  // Progress and Status
  const progress = Number(certificateData.progress?.percentage) || 0;
  const rawInternshipStatus = certificateData.internship?.status || certificateData.internshipStatus || "";
  const internshipStatus = rawInternshipStatus.toLowerCase();
  const rejectionReason =
    certificateData.internship?.rejectionReason ||
    certificateData.rejectionReason ||
    "";
  const rejectedAt =
    certificateData.internship?.rejectedAt ||
    certificateData.rejectedAt ||
    null;

  const isCompleted = internshipStatus === "completed";
  const isRejected = internshipStatus === "rejected";

  // CERTIFICATE READY: Strictly requires Teacher Approved + Manager Approved + Internship Status is Completed
  const certificateReady = teacherApproved && managerApproved && isCompleted;

  // CERTIFICATE STATUS LOGIC
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

  // STATUS CLASS
  const getStatusClass = (status) => {
    switch (status) {
      case "Approved": return "status-approved";
      case "Processing": return "status-processing";
      case "Eligible": return "status-eligible";
      case "Waiting for Approval": return "status-waiting";
      case "Ongoing": return "status-ongoing";
      case "Not Eligible":
      default: 
        return "status-not-eligible";
    }
  };

  return (
    <div className="page active">
      {/* PAGE TITLE */}
      <h2 style={{ textAlign: "center", color: "#1e3a8a" }}>Internship Completion Certificate</h2>

      {/* CERTIFICATE STATUS CARD */}
      <div className="certificate" id="printable-certificate">
        <h1>Certificate of Internship Completion</h1>
        <p>This is to certify that</p>
        <h2>{studentName}</h2>
        <p>has successfully completed an internship at</p>
        <h2>{companyName}</h2>
        <p>Duration:</p>
        <h3>{formatDate(startDate)} - {formatDate(endDate)}</h3>
        <br />
        <p>
          During this internship, the student worked on
          assigned projects and successfully completed
          the assigned tasks.
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
                <div className={`certificate-status-badge ${getStatusClass(teacherStatus)}`}>
                  {teacherStatus}
                </div>
              </td>
              <td>
                <strong>{managerName}</strong>
                <br />
                <div className={`certificate-status-badge ${getStatusClass(managerStatus)}`}>
                  {managerStatus}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* PROGRESS INFORMATION */}
        <div className="certificate-progress">
          <p>
            <strong>Internship Progress:</strong> {progress}%
          </p>
          <p>
            <strong>Internship Status:</strong>{" "}
            <span style={{ textTransform: "capitalize", fontWeight: "600" }}>
              {rawInternshipStatus || "Not Available"}
            </span>
          </p>
        </div>

        {/* REJECTED STATE BANNER */}
        {isRejected && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px 20px",
              background: "#fff5f5",
              border: "1px solid #feb2b2",
              borderLeft: "5px solid #e53e3e",
              borderRadius: "8px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>❌</span>
              <strong style={{ color: "#9b2c2c", fontSize: "15px" }}>
                Internship Rejected by Admin
              </strong>
            </div>
            {rejectionReason ? (
              <p style={{ margin: "0 0 6px 0", color: "#2d3748", fontSize: "14px", lineHeight: "1.5" }}>
                <strong>Rejection Reason:</strong> {rejectionReason}
              </p>
            ) : (
              <p style={{ margin: "0 0 6px 0", color: "#2d3748", fontSize: "14px" }}>
                Your internship record has been marked as rejected. Certificate issuance is disabled.
              </p>
            )}
            {rejectedAt && (
              <small style={{ color: "#718096", fontSize: "12px" }}>
                Rejected Date: {formatDate(rejectedAt)}
              </small>
            )}
          </div>
        )}

        {/* READY / APPROVED STATE */}
        {!isRejected && certificateReady && (
          <div className="certificate-download-message">
            <p>
              <strong>
                Your certificate has been approved by both Teacher and Manager, and your internship is Completed.
              </strong>
            </p>
            <p>You can now download your official certificate.</p>
            <Link to="/student/certificate" className="certificate-download-link">
              Download Certificate
            </Link>
          </div>
        )}

        {/* PENDING / INCOMPLETE STATE */}
        {!isRejected && !certificateReady && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#475569",
              fontSize: "13.5px",
            }}
          >
            <p style={{ margin: 0 }}>
              {!isCompleted
                ? "⏳ Certificate will become available once your internship is marked as Completed and approved by both Teacher and Manager."
                : "⏳ Waiting for final approvals from Teacher and Manager."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}