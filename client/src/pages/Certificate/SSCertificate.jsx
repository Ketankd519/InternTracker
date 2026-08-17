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
      console.log("CERTIFICATE STATUS RESPONSE:", response.data);

      setCertificateData(response.data?.data || {});
    } catch (err) {
      console.error("Certificate Status Error:", err);

      console.error(
        err.response?.data?.message ||
          "Unable to fetch certificate status."
      );

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

  // // ERROR
  // if (error) {
  //   return (
  //     <div className="certificate-status-page">
  //       <div className="certificate-status-card error-card">
  //         <h2>Certificate Status</h2>
  //         <p>{error}</p>

  //         <button
  //           className="certificate-refresh-btn"
  //           onClick={fetchCertificateStatus}
  //         >
  //           Try Again
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

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

// Progress
const progress = Number(certificateData.progress?.percentage) || 0;
const internshipStatus = certificateData.internship?.status || "";

// CERTIFICATE STATUS LOGIC

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

  const certificateReady = teacherApproved && managerApproved;

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
      case "Approved":
        return "status-approved";

      case "Processing":
        return "status-processing";

      case "Eligible":
        return "status-eligible";

      case "Waiting for Approval":
        return "status-waiting";

      case "Ongoing":
        return "status-ongoing";

      case "Not Eligible":
      default:
        return "status-not-eligible";
    }
  };

  return (
    <div className="page active">

      {/* PAGE TITLE */}
      <h2 style={{ textAlign: 'center', color: '#1e3a8a' }}>
        Internship Completion Certificate
      </h2>

      {/* CERTIFICATE STATUS CARD */}
      <div className="certificate" id="printable-certificate">
        <h1>Certificate of Internship Completion</h1>
        <p>This is to certify that</p>
        <h2>{studentName}</h2>
        <p>has successfully completed an internship at</p>
        <h2>{companyName}</h2>
        <p>Duration:</p>
        <h3>{formatDate(startDate)} - {formatDate(endDate)}</h3>
        <br/>
        <p>During this internship, the student worked on
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
                <br></br>
                <div className={`certificate-status-badge ${getStatusClass(
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

        {/* PROGRESS INFORMATION */}
        <div className="certificate-progress">
          <p><strong>Internship Progress:</strong>{" "}
            {progress}%
          </p>
          <p>
            <strong>Internship Status:</strong>{" "}
            {internshipStatus || "Not Available"}
          </p>
        </div>

        {/* DOWNLOAD MESSAGE */}
        {certificateReady && (
          <div className="certificate-download-message">
            <p>
              <strong>
                Your certificate has been approved by
                both Teacher and Manager.
              </strong>
            </p>
            <p>You can now download your certificate.</p>
            <Link to="/student/certificate" className="certificate-download-link">
              Download Certificate
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}