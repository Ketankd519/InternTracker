import { useEffect, useState } from "react";
import API from "../../services/api";
import "./AdminStudents.css";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Certificate for View Modal
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/admin/certificates");
      setCertificates(response.data?.data || []);
    } catch (err) {
      console.error("Admin Certificates Error:", err);
      setError(err.response?.data?.message || "Failed to load certificate records");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCertificates = certificates.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.rollNumber?.toLowerCase().includes(q) ||
      item.companyName?.toLowerCase().includes(q) ||
      item.teacherName?.toLowerCase().includes(q) ||
      item.managerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="teacher-page" style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <div className="teacher-page-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
            Eligible Certificates ({certificates.length})
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Review students eligible for certificate issuance and their approval matrix.
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by student, roll no, company, teacher, manager..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      {/* ERROR / LOADING */}
      {loading && <div className="teacher-loading">Loading certificate records...</div>}
      {error && <div className="teacher-error">{error}</div>}

      {/* CERTIFICATES TABLE */}
      {!loading && !error && (
        <div className="teacher-table-container" style={{ background: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table className="teacher-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Sr. No</th>
                <th>Name</th>
                <th>Ending Date</th>
                <th>Internship Status</th>
                <th>Teacher</th>
                <th>Manager</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    No eligible certificate records found.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{item.studentName}</div>
                      <small style={{ color: "#64748b" }}>{item.rollNumber !== "N/A" ? `Roll: ${item.rollNumber}` : ""}</small>
                    </td>
                    <td>{formatDate(item.endingDate)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.internshipStatus === "completed"
                            ? "status-approved"
                            : item.internshipStatus === "rejected"
                            ? "status-rejected"
                            : "status-pending"
                        }`}
                      >
                        {item.internshipStatus}
                      </span>
                    </td>

                    {/* CONDITIONAL TEACHER BORDER */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "500",
                          background: item.teacherApproved ? "#f0fdf4" : "#fef2f2",
                          color: item.teacherApproved ? "#166534" : "#991b1b",
                          border: `1.5px solid ${item.teacherApproved ? "#22c55e" : "#ef4444"}`,
                        }}
                      >
                        {item.teacherName}
                      </span>
                    </td>

                    {/* CONDITIONAL MANAGER BORDER */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "500",
                          background: item.managerApproved ? "#f0fdf4" : "#fef2f2",
                          color: item.managerApproved ? "#166534" : "#991b1b",
                          border: `1.5px solid ${item.managerApproved ? "#22c55e" : "#ef4444"}`,
                        }}
                      >
                        {item.managerName}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedCert(item)}
                        style={{
                          padding: "7px 14px",
                          background: "#3b82f6",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#2563eb")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#3b82f6")}
                      >
                        View Certificate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= VIEW CERTIFICATE MODAL ================= */}
      {selectedCert && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "560px", padding: "24px" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Certificate & Internship Overview</h2>
              <button className="btn-close" onClick={() => setSelectedCert(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#334155", fontSize: "14px" }}>🎓 Student Information</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                  <div><strong>Student Name:</strong> {selectedCert.studentName}</div>
                  <div><strong>Roll Number:</strong> {selectedCert.rollNumber}</div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#334155", fontSize: "14px" }}>🏢 Internship Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                  <div><strong>Company:</strong> {selectedCert.companyName}</div>
                  <div><strong>Role:</strong> {selectedCert.jobRole}</div>
                  <div><strong>Start Date:</strong> {formatDate(selectedCert.startingDate)}</div>
                  <div><strong>End Date:</strong> {formatDate(selectedCert.endingDate)}</div>
                  <div style={{ gridColumn: "span 2" }}>
                    <strong>Internship Status:</strong>{" "}
                    <span style={{ textTransform: "capitalize", fontWeight: "600", color: selectedCert.internshipStatus === "completed" ? "#16a34a" : "#ca8a04" }}>
                      {selectedCert.internshipStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#334155", fontSize: "14px" }}>⚖️ Approval Matrix</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                  <div style={{ padding: "8px", borderRadius: "6px", background: selectedCert.teacherApproved ? "#f0fdf4" : "#fef2f2", border: `1px solid ${selectedCert.teacherApproved ? "#bbf7d0" : "#fecaca"}` }}>
                    <div><strong>Teacher:</strong> {selectedCert.teacherName}</div>
                    <div style={{ fontWeight: "600", marginTop: "2px", color: selectedCert.teacherApproved ? "#166534" : "#991b1b" }}>
                      {selectedCert.teacherApproved ? "✓ Teacher Approved" : "✕ Not Approved"}
                    </div>
                  </div>

                  <div style={{ padding: "8px", borderRadius: "6px", background: selectedCert.managerApproved ? "#f0fdf4" : "#fef2f2", border: `1px solid ${selectedCert.managerApproved ? "#bbf7d0" : "#fecaca"}` }}>
                    <div><strong>Manager:</strong> {selectedCert.managerName}</div>
                    <div style={{ fontWeight: "600", marginTop: "2px", color: selectedCert.managerApproved ? "#166534" : "#991b1b" }}>
                      {selectedCert.managerApproved ? "✓ Manager Approved" : "✕ Not Approved"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedCert(null)}
                style={{ padding: "8px 18px", borderRadius: "6px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}