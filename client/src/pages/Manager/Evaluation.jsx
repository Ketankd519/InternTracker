import { useEffect, useState } from "react";
import api from "../../services/api";
import "./ManagerStyle.css";

export default function ManagerEvaluation() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/manager/evaluation");
      setReports(response.data.reports || []);
    } catch (error) {
      console.error("Evaluation Error:", error);
      setError(
        error.response?.data?.message ||
        "Failed to load weekly reports"
      );

    } finally {
      setLoading(false);
    }
  };

  // APPROVE
  const handleApprove = async (reportId) => {
    const confirmed = window.confirm(
        "Are you sure you want to approve this weekly report?"
      );

    if (!confirmed) {
      return;
    }
    try {
      setProcessingId(reportId);
      await api.put(`/manager/reports/${reportId}/approve`);
      alert("Weekly report approved successfully.");
      await fetchReports();
    } catch (error) {
      console.error("Approve Error:",error);
      alert(error.response?.data?.message || "Failed to approve report."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // SHOW REJECTION BOX
  const showRejectBox = (reportId) => {
    setRejectingId(reportId);
    setRemark("");
  };

  // CANCEL REJECTION
  const cancelReject = () => {
    setRejectingId(null);
    setRemark("");
  };

  // REJECT
  const handleReject = async (reportId) => {
    if (!remark.trim()) {
      alert("Please enter a rejection remark.");
      return;
    }
    try {
      setProcessingId(reportId);
      await api.put(`/manager/reports/${reportId}/reject`,
        {
          rejectionRemark:
            remark.trim(),
        }
      );
      alert("Weekly report rejected successfully.");
      setRejectingId(null);
      setRemark("");
      await fetchReports();
    } catch (error) {
      console.error("Reject Error:",error);
      alert(error.response?.data?.message || "Failed to reject report.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved": return "manager-status-approved";
      case "Rejected": return "manager-status-rejected";
      case "Pending": return "manager-status-pending";
      default: return "manager-status-default";
    }
  };
  if (loading) {
    return (
      <div className="manager-page">
        <div className="manager-loading">
          Loading weekly reports...
        </div>
      </div>
    );
  }

  return (
    <div className="manager-page">

          {/* HEADER */}
      <div className="manager-page-header">
        <div>
          <h1>Weekly Report Evaluation</h1>
          <p>Review and evaluate student weekly internship reports.</p>
        </div>
        <div className="manager-count-badge">{reports.length} Reports</div>
      </div>
      {error && (
        <div className="manager-error">
          {error}
        </div>
      )}

          {/* REPORT TABLE */}
      <div className="manager-table-container">
        <table className="manager-table evaluation-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Roll No</th>
              <th>Submission Date</th>
              <th>Student Name</th>
              <th>Week</th>
              <th>Task Title</th>
              <th>Description</th>
              <th>Attachment</th>
              <th>Report Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="10" className="manager-empty-table">
                  No weekly reports found.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                  <tr key={report.reportId}>
                    {/* Sr No */}
                    <td>{report.srNo}</td>

                    {/* Roll No */}
                    <td>{report.rollNo || "-"}</td>

                    {/* Submission Date */}
                    <td>{formatDate(report.submissionDate)}
                    </td>

                    {/* Student Name */}
                    <td>
                      <strong>{report.studentName}</strong>
                    </td>

                    {/* Week */}
                    <td>
                      <strong>Week{" "}{report.weekNumber}</strong>
                    </td>

                    {/* Task */}
                    <td>{report.taskTitle || "-"}</td>

                    {/* Description */}
                    <td className="evaluation-description">
                      {report.description || "-"}
                    </td>

                    {/* Attachment */}
                    <td>
                      {report.attachment ? (
                        <a href={getAttachmentUrl(report.attachment)}
                          target="_blank"
                          rel="noreferrer"
                          className="manager-attachment-link"
                        >View Attachment</a>
                      ) : (
                        "No Attachment"
                      )}
                    </td>

                    {/* Manager Verification */}
                    <td>
                      <span className={`manager-status-badge ${getStatusClass(
                              report.status
                            )}`}
                      > {report.status}
                      </span>

                      {report.managerVerified && (
                        <span className="manager-small-verified">
                          ✓ Verified
                        </span>
                      )}

                      {report.rejectionRemark && (
                        <div className="manager-existing-remark">
                          <strong>Remark:</strong>{" "}
                          {report.rejectionRemark}
                        </div>
                      )}
                    </td>

                    {/* ACTION */}
                    <td>
                      {report.status === "Pending" ? (
                        <div className="manager-action-area">
                          <button className="manager-approve-btn"
                            onClick={() =>
                              handleApprove(report.reportId)
                            }
                            disabled={
                              processingId === report.reportId
                            }
                          >
                            {processingId === report.reportId
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button className="manager-reject-btn"
                            onClick={() =>
                              showRejectBox(report.reportId)
                            }
                            disabled={
                              processingId === report.reportId
                            }
                          >
                            Reject
                          </button>

                          {rejectingId === report.reportId && (
                            <div className="manager-reject-box">
                              <textarea value={remark}
                                onChange={(e) =>
                                  setRemark(e.target.value)
                                }
                                placeholder="Enter rejection remark..."
                                rows="4"
                              />

                              <div className="manager-reject-actions">
                                <button className="manager-confirm-reject-btn"
                                  onClick={() =>
                                    handleReject( report.reportId)
                                  }
                                  disabled={
                                    processingId === report.reportId
                                  }
                                >
                                  Confirm Reject
                                </button>

                                <button className="manager-cancel-reject-btn"
                                  onClick={ cancelReject }
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="manager-action-completed">
                          {report.status === "Approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// HELPERS
function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date)
    .toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
}

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

  // Convert Windows backslashes to normal URL slashes
  let cleanPath = attachment.replace(/\\/g, "/");

  /*
    Handle absolute Windows path:
    C:/Users/ASUS/.../server/uploads/reports/file.pdf
    We only need:
    reports/file.pdf
  */
  const uploadsIndex = cleanPath.indexOf("/uploads/");

  if (uploadsIndex !== -1) {
    cleanPath = cleanPath.substring(
      uploadsIndex + "/uploads/".length
    );
  }

  // Handle path already stored as:
  // uploads/reports/file.pdf
  cleanPath = cleanPath.replace(/^uploads\//, "");

  return `http://localhost:5000/uploads/${cleanPath}`;
}