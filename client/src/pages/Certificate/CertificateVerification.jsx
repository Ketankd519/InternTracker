import { useState } from "react";
import API from "../../services/api";
import "./CertificateVerification.css";

export default function CertificateVerification() {
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
  
    const trimmedCertificateId = certificateId.trim();
    if (!trimmedCertificateId) {
      setError("Please enter a Certificate ID.");
      setCertificate(null);
      setMessage("");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setCertificate(null);

    const response = await API.get(`/certificates/verify/${encodeURIComponent(
          trimmedCertificateId)}`
        );
    const result = response.data;
      if (result.success && result.data) {
        setCertificate({
          ...result.data,
          isVerified: result.verified === true,
        });
        setMessage("Certificate found successfully.");
      } else {
        setError(
          result.message || "No certificate found for this Certificate ID."
        );
      }
    } catch (err) {
      console.error( "Certificate Verification Error:", err);

      setCertificate(null);
      setError(
        err.response?.data?.message ||
          "No certificate found for this Certificate ID or the Certificate ID is incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="certificate-verification-page">

          {/* PAGE HEADER */}
      <div className="certificate-verification-header">
        <h1>Certificate Verification</h1>
        <p>Verify the authenticity of an InternTrack certificate using its Certificate ID.</p>
      </div>
      <div className="certificate-verification-container">

            {/* SEARCH CARD */}
        <div className="certificate-search-card">
          <div className="certificate-card-title">
            <div className="certificate-card-icon">
              🔍
            </div>
            <h2>Verify Your Certificate</h2>
          </div>
          <p className="certificate-card-subtitle">
            Enter the Certificate ID provided on the
            certificate to verify its authenticity.
          </p>

          <form className="certificate-search-form" onSubmit={handleSearch}>
            <label htmlFor="certificateId" className="certificate-search-label">
              Certificate ID
            </label>
            <div className="certificate-search-row">
              <div className="certificate-input-wrapper">
                <span className="certificate-input-icon">
                  🪪
                </span>
                <input type="text" id="certificateId" name="certificateId"
                  className="certificate-id-input" placeholder="Enter Certificate ID"
                  value={certificateId} onChange={(e) => setCertificateId(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="certificate-search-button" disabled={loading}>
                <span className="certificate-search-button-icon">
                  🔍
                </span>
                {loading
                  ? "Searching..."
                  : "Search Certificate"}
              </button>
            </div>

            <p className="certificate-helper-text">
              <span className="certificate-helper-icon"> i </span>
              Certificate ID is the unique ID printed on
              the certificate.
            </p>
          </form>
        </div>

            {/* ERROR MESSAGE */}
        {error && (
          <div className="certificate-error-message">
            <div className="certificate-error-icon"> ! </div>
            <div>
              <p>{error}</p>
            </div>
          </div>
        )}

            {/* SUCCESS MESSAGE */}
        {message && !error && (
          <div className="certificate-success-message">
            <div className="certificate-success-icon"> ✓ </div>
            <div>
              <strong> Certificate found successfully. </strong>
              <p>The certificate details are displayed below.</p>
            </div>
          </div>
        )}

            {/* CERTIFICATE DETAILS */}
        {certificate && (
          <div className="certificate-details-card">

            {/* Details Header */}
            <div className="certificate-details-title">
              <div className="certificate-details-icon">
                📋
              </div>
              <h2>Certificate Details</h2>
            </div>

                {/* VERIFICATION STATUS */}
            <div className={`certificate-verification-status 
              ${certificate.isVerified
                 ? "verified"
                 : "not-verified"
              }`}
            >
              {certificate.isVerified ? (
                <>
                  <span className="certificate-verified-icon"></span>
                  <div>
                    <strong>Student Certificate is Verified</strong>
                    <p>This certificate has been approved by both the Teacher and Manager.</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="certificate-not-verified-icon"></span>
                  <div>
                    <strong> Certificate is Not Verified</strong>
                    <p>This certificate has not yet received both required approvals.</p>
                  </div>
                </>
              )}
            </div>

                {/* CERTIFICATE INFORMATION */}
            <div className="certificate-details-grid">

              {/* Certificate ID */}
              <div className="certificate-detail-item">
                <div className="certificate-detail-icon">
                  🪪
                </div>
                <div className="certificate-detail-content">
                  <span className="certificate-detail-label">
                    Certificate ID
                  </span>
                  <span className="certificate-detail-value">
                    {certificate.certificateId || "-"}
                  </span>
                </div>
              </div>

              {/* Student Name */}
              <div className="certificate-detail-item">
                <div className="certificate-detail-icon">
                  🧑‍🎓
                </div>
                <div className="certificate-detail-content">
                  <span className="certificate-detail-label">
                    Student Name
                  </span>
                  <span className="certificate-detail-value">
                    {certificate.studentName || "-"}
                  </span>
                </div>
              </div>

              {/* Company Name */}
              <div className="certificate-detail-item">
                <div className="certificate-detail-icon">
                  ▥
                </div>
                <div className="certificate-detail-content">
                  <span className="certificate-detail-label">
                    Company Name
                  </span>
                  <span className="certificate-detail-value">
                    {certificate.companyName || "-"}
                  </span>
                </div>
              </div>

              {/* Manager Name */}
              <div className="certificate-detail-item">
                <div className="certificate-detail-icon">
                  💼
                </div>
                <div className="certificate-detail-content">
                  <span className="certificate-detail-label">
                    Manager Name
                  </span>
                  <span className="certificate-detail-value">
                    {certificate.managerName || "-"}
                  </span>
                </div>
              </div>

              {/* Teacher Name */}
              <div className="certificate-detail-item">
                <div className="certificate-detail-icon">
                  🧑‍🏫
                </div>
                <div className="certificate-detail-content">
                  <span className="certificate-detail-label">
                    Teacher Name
                  </span>
                  <span className="certificate-detail-value">
                    {certificate.teacherName || "-"}
                  </span>
                </div>
              </div>

              {/* Issue Date */}
              <div className="certificate-detail-item">
                <div className="certificate-detail-icon">
                  📅
                </div>
                <div className="certificate-detail-content">
                  <span className="certificate-detail-label">
                    Issue Date
                  </span>
                  <span className="certificate-detail-value">
                    {formatDate(certificate.issueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}