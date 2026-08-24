import { useEffect,useRef, useState } from "react";
import API from "../../services/api";
import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import "./Certificate.css";

export default function Certificate() {

  const certificateRef = useRef(null);
  const [certificateData, setCertificateData] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH CERTIFICATE DATA
  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/certificates/status");
      const data = response.data?.data || null;

      setCertificateData(data);

      // QR CODE, When someone scans the QR code, it opens the
      // InternTrack Home page. Change "/" to another public verification route
      // later if you create one.

      if (data?.teacherApproved === true && data?.managerApproved === true) 
        {
          const homeURL = `${window.location.origin}/`;
          const qr = await QRCode.toDataURL(homeURL, {
            width: 180, margin: 1, errorCorrectionLevel: "H",
          });
        setQrCode(qr);
        } else {
          setQrCode("");
        }

      } catch (err) {
        console.error("Final Certificate Fetch Error:", err);

        setError( err.response?.data?.message || "Unable to fetch certificate information.");
      } finally {
          setLoading(false);
      }
    };

    // LOADING
    if (loading) {
      return (
        <div className="final-certificate-page">
          <div className="certificate-loading">Loading certificate...</div>
        </div>
      );
    }

    // ERROR
    if (error) {
      return (
        <div className="final-certificate-page">
          <div className="certificate-error">
            <h2>Certificate</h2>
            <p>{error}</p>
            <button onClick={fetchCertificate} className="certificate-refresh-btn">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // DATA
      const data = certificateData || {};
      const studentName = data.studentName || "Student Name";
      const companyName = data.companyName || "Company Name";
      const teacherName = data.teacherName || "Teacher Name";
      const managerName = data.managerName || "Manager Name";
      const startDate = data.internshipStartDate || null;
      const endDate = data.internshipEndDate || null;

    // APPROVAL CONDITIONS
      const teacherApproved = data.teacherApproved === true;
      const managerApproved = data.managerApproved === true;
      const certificateApproved = teacherApproved && managerApproved;

    // VERIFICATION CONDITIONS
      const teacherVerified = data.teacherVerified === true;
      const managerVerified = data.managerVerified === true;

    // Certificate is not displayed until at least
    // one side (Teacher or Manager) verifies the student.
      const certificateVisible = teacherVerified || managerVerified;

    // CERTIFICATE VISIBILITY
    if (!certificateVisible) {
      return (
        <div className="final-certificate-page">
          <div className="certificate-error">
            <h2>Certificate</h2>
            <p>Certificate is not available yet.</p>
          </div>
        </div>
      );
    }

    // SIGNATURES
      const teacherSignature = data.teacherSignature || "";
      const managerSignature = data.managerSignature || "";

    // CERTIFICATE NUMBER
      const certificateNumber = data.certificateId || "";

    // DATE FORMAT
      const formatDate = (date) => {
      if (!date) {
        return "Not Available";
      }

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "Not Available";
      }

      return parsedDate.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    };

    // DOWNLOAD CERTIFICATE
      const downloadCertificate = () => {
        if (!certificateApproved) {
          return;
        }

      const element = certificateRef.current;
        if (!element) {
          return;
        }

      const options = {
        margin: 0,

        filename: `InternTrack-Certificate-${studentName 
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`,

        image: {
          type: "jpeg",
          quality: 1,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        },

        jsPDF: {
          unit: "px",
          format: [1536, 1024],
          orientation: "landscape",
        },
      };

      html2pdf()
        .set(options)
        .from(element)
        .save();
    };

  // RENDER
  return (
    <div className="final-certificate-page">

          {/* PAGE HEADING */}
      <div className="final-certificate-heading">
        <h2>Internship Completion Certificate</h2>
        <p>Final Certificate</p>
      </div>

          {/* CERTIFICATE */}
      <div ref={certificateRef} id="final-certificate"
        className={`final-certificate 
          ${certificateApproved
            ? "certificate-unlocked"
            : "certificate-locked"
          }`}>

            {/* BACKGROUND TEMPLATE */}
        <img src="/certificate-template.png"
          className="certificate-template"
          alt="InternTrack Certificate"
          crossOrigin="anonymous"
        />

            {/* STUDENT NAME */}
        <div className="certificate-student-name">
          {studentName}
        </div>

            {/* COMPANY NAME */}
        <div className="certificate-company-name">
          {companyName}
        </div>

            {/* START DATE */}
        <div className="certificate-start-date">
          {formatDate(startDate)}
        </div>

            {/* END DATE */}
        <div className="certificate-end-date">
          {formatDate(endDate)}
        </div>

            {/* TEACHER APPROVAL */}
        {teacherApproved && (
          <div className="teacher-approved-mark"> ✓ </div>
        )}

            {/* MANAGER APPROVAL */}
        {managerApproved && (
          <div className="manager-approved-mark"> ✓ </div>
        )}

            {/* TEACHER NAME */}
        <div className={`certificate-teacher-name 
              ${teacherVerified
                ? "visible"
                : "hidden"
              }`
            }>
          Teacher: {teacherName}
        </div>

            {/* MANAGER NAME */}
        <div className={`certificate-manager-name 
              ${managerVerified
                ? "visible"
                : "hidden"
              }`
            }>
          Manager: {managerName}
        </div>

            {/* TEACHER SIGNATURE */}
        {teacherApproved && teacherSignature && (
            <div className="teacher-signature">
              <img src={teacherSignature}
                alt="Teacher Digital Signature"
                crossOrigin="anonymous"
              />
            </div>
          )}

            {/* MANAGER SIGNATURE */}
        {managerApproved && managerSignature && (
            <div className="manager-signature">
              <img src={managerSignature}
                alt="Manager Digital Signature"
                crossOrigin="anonymous"
              />
            </div>
          )}

            {/* QR CODE */}
        {certificateApproved && qrCode && (
            <div className="certificate-qr-area">
              <img src={qrCode} alt="Certificate QR Code"/>
            </div>
          )}

            {/* CERTIFICATE NUMBER */}
        {certificateApproved && certificateNumber && (
            <div className="certificate-number">
              <span>{certificateNumber}</span>
            </div>
          )}
      </div>

          {/* DOWNLOAD SECTION */}
      <div className="certificate-download-section">
        {!certificateApproved && (
          <p className="certificate-download-disabled-message">
            Certificate download will be available after
            both Teacher and Manager approvals.
          </p>
        )}

        {certificateApproved && (
          <p className="certificate-download-ready-message">
            ✓ Certificate approved by Teacher and Manager.
          </p>
        )}

        <button type="button" className={`certificate-download-btn 
            ${certificateApproved
              ? "enabled"
              : "disabled"
            }`
          } disabled={!certificateApproved} onClick={downloadCertificate}
        >
            {certificateApproved
              ? "Download Certificate"
              : "Certificate Not Approved"}
        </button>
      </div>
    </div>
  );
}