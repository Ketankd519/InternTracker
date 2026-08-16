import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

export default function TCCertificate() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentCertificate();
  }, [studentId]);

  const fetchStudentCertificate = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get( `/certificates/student/${studentId}` );
      console.log( "TEACHER CERTIFICATE RESPONSE:", response.data);
      setCertificateData(response.data?.data || null);
    } catch (err) {
      console.error( "Teacher Certificate Error:", err);

      setError(err.response?.data?.message || "Unable to fetch student certificate.");
    } finally {
      setLoading(false);
    }
  };

  // TEACHER APPROVAL
  const handleTeacherApprove = async () => {
    try {
      if (!studentId) return;
      setApproving(true);
      const response = await API.put(`/certificates/${studentId}/teacher-approve`);

      console.log("TEACHER APPROVAL RESPONSE:", response.data);
      alert( response.data?.message || "Certificate approved successfully.");

      // Fetch latest data
      await fetchStudentCertificate();
    } catch (err) {
      console.error("Teacher Approval Error:",err);

      alert( err.response?.data?.message || "Unable to approve certificate.");
    } finally {
      setApproving(false);
    }
  };

    // LOADING
  if (loading) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Certificate</h2>
        <div className="certificate">
          <h2>Loading Certificate...</h2>
          <p>Please wait while certificate details are being fetched.</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Certificate</h2>
        <div className="certificate error-card">
          <h2>Unable to Load Certificate</h2>
          <p>{error}</p>
          <button className="certificate-refresh-btn" onClick={fetchStudentCertificate}>
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
const internshipStatus = certificateData.internship?.status || "";

  let teacherStatus = "Not Eligible";
  let managerStatus = "Not Eligible";

  if (teacherVerified && managerVerified){
    teacherStatus = "Processing";
    managerStatus = "Processing";
  } else {
    teacherStatus = teacherVerified
      ? "Eligible"
      : "Not Eligible";

    managerStatus = managerVerified
      ? "Eligible"
      : "Not Eligible";
  }

  const isCompleted = progress === 100 || internshipStatus.toLowerCase() === "completed";

  if (!teacherApproved) {
    if (isCompleted) {
      teacherStatus = "Waiting for Approval";
    } else if (progress <= 50) {
      teacherStatus = "Ongoing";
    }
  }

    if (!managerApproved) {
    if (isCompleted) {
      managerStatus = "Waiting for Approval";
    } else if (progress <= 50) {
      managerStatus = "Ongoing";
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
      case "Approved":return "status-approved";
      case "Processing": return "status-processing";
      case "Eligible": return "status-eligible";
      case "Waiting for Approval": return "status-waiting";
      case "Ongoing": return "status-ongoing";
      case "Not Eligible": default: return "status-not-eligible";
    }
  };


  if (!certificateData) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Certificate</h2>
        <div className="certificate">
          <h2>No Certificate Data</h2>
          <p> Certificate information for this student is not available.</p>
        </div>
      </div>
    );
  }


  // -----------------------------------------
  // RENDER
  // -----------------------------------------

  return (
    <div className="page active">

      {/* PAGE TITLE */}
      <h2 style={{ textAlign: 'center', color: '#1e3a8a' }}>
        Student Internship Certificate
      </h2>

      {/* CERTIFICATE */}
      <div
        className="certificate"
        id="printable-certificate"
      >

        <h1>
          Certificate of Internship Completion
        </h1>

        <p>
          This is to certify that
        </p>

        <h2>
          {studentName}
        </h2>

        <p>
          has successfully completed an internship at
        </p>

        <h2>
          {companyName}
        </h2>

        <p>
          Duration:
        </p>

        <h3>
          {formatDate(startDate)} -{" "}
          {formatDate(endDate)}
        </h3>

        <p>
          During this internship, the student worked
          on assigned projects and successfully
          completed the assigned tasks.
        </p>

        {/* VERIFICATION TABLE */}
        <table>

          <thead>
            <tr>
              <th>
                Verified By Teacher
              </th>

              <th>
                Verified By Manager
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{teacherName}</strong>
                <div
                  className={`certificate-status-badge ${getStatusClass(
                    teacherStatus
                  )}`}
                >
                  {teacherStatus}
                </div>

              </td>
              {/* MANAGER */}
              <td>
                <strong>{managerName}</strong>
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

        {/* PROGRESS */}
        <div className="certificate-progress">
          <p>
            <strong>Internship Progress:</strong>{" "}{progress}%
          </p>
          <p>
            <strong>Internship Status:</strong>{" "}{internshipStatus || "Not Available"}
          </p>
        </div>

      {/* TRACHER APPROVAL SECTION */}
    <div style={{marginTop: "25px", textAlign: "center",}}></div>
      {teacherApproved ? (
            <div
              className="certificate-status-badge status-approved"
              style={{
                display: "inline-block",
                padding: "12px 25px",
                fontSize: "16px",
              }}
            >
              ✔ Certificate Approved by Teacher
            </div>
      ) : (
         <button
              className="btn"
              onClick={handleTeacherApprove}
              disabled={approving}
              style={{
                padding: "12px 28px",
                fontSize: "16px",
                cursor: approving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {approving
                ? "Approving..."
                : "Verify Certificate"}
            </button>
          )}
      
        {/* BACK BUTTON */}
        <button
          className="teacher-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to Student Certificates
        </button>
      </div>
    </div>
  );
}