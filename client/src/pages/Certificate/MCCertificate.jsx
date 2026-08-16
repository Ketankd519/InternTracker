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
      console.log("MANAGER CERTIFICATE RESPONSE:",response.data);
      setCertificateData(response.data?.data || null);
    } catch (err) {
      console.error("Manager Certificate Fetch Error:",err);

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

      console.log("MANAGER APPROVAL RESPONSE:", response.data);
      alert(response.data?.message || "Certificate approved successfully.");     

      // Refresh certificate data
      await fetchCertificate();
    } catch (err) {
      console.error("Manager Certificate Approval Error:",err);

      alert(err.response?.data?.message || "Unable to approve certificate.");
    } finally {
      setApproving(false);
    }
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
  if (error && !certificateData) {
    return (
      <div className="student-certificate-page">
        <h2 className="certificate-page-title">Student Internship Certificate</h2>
        <div className="certificate">
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
const internshipStatus = certificateData.internship?.status || "Not Available";


let teacherStatus = "Not Eligible";
let managerStatus = "Not Eligible";

/*
  STEP 1:
  Teacher and Manager verification

  ❌ ❌ -> Not Eligible / Not Eligible
  ✅ ❌ -> Eligible / Not Eligible
  ❌ ✅ -> Not Eligible / Eligible
  ✅ ✅ -> Progress-based status
*/

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

  /*
    STEP 2:
    Both Teacher and Manager verified.

    0% - 50%  -> Processing
    51% - 99%  -> Ongoing
    100%       -> Waiting for Approval
  */

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

  /*
    Final certificate approval
    certificates.teacherApproved === true
    certificates.managerApproved === true
    => Approved / Approved
  */

  if (teacherApproved) {
    teacherStatus = "Approved";
  }

  if (managerApproved) {
    managerStatus = "Approved";
  }

// DATE FORMAT
  const formatDate = (date) => {
    if (!date) { return "Not Available";}
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

  // RENDER
  return (
    <div className="page active">

      {/* PAGE TITLE */}
      <h2 style={{ textAlign: 'center', color: '#1e3a8a' }}>Student Internship Certificate</h2>

          {/* CERTIFICATE */}
      <div className="certificate" id="printable-certificate">
        <h1>Certificate of Internship Completion</h1>
        <p>This is to certify that</p>
        <h2>{studentName}</h2>
        <p>has successfully completed an internship at</p>
        <h2>{companyName}</h2>
        <p>Duration:</p>
        <h3>
          {formatDate(startDate)} -{" "}
          {formatDate(endDate)}
        </h3>
        <p>During this internship, the student worked on
          assigned projects and successfully completed
          the assigned tasks.
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
                <br></br>
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
                <br></br>
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
            <strong>Internship Progress:</strong>{" "}{progress}%
          </p>
          <p>
            <strong>Internship Status:</strong>{" "}{internshipStatus || "Not Available"}
          </p>
        </div>


            {/* MANAGER APPROVAL SECTION */}
        <div style={{marginTop: "25px", textAlign: "center",}}>
          {managerApproved ? (
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
          
        </div>

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