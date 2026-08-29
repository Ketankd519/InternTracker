import { useEffect, useState } from "react";
import API from "../../services/api";
import "./StudentStyle.css";

export default function Dashboard() {
  const [studentName, setStudentName] = useState("");
  const [internship, setInternship] = useState(null);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [submittedReports, setSubmittedReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [approvedReports, setApprovedReports] = useState(0);
  const [rejectedReports, setRejectedReports] = useState(0);

  // Student verification
  const [teacherVerified, setTeacherVerified] = useState(false);

  // Internship verification
  const [managerVerified, setManagerVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Deletion Audit Notice state
  const [deletionNotice, setDeletionNotice] = useState({
    isDeleted: false,
    reason: "",
  });

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // 1. STUDENT PROFILE
      try {
        const response = await API.get("/students/profile");
        const result = response.data;
        const user = result.data?.user;

        // Name always comes from USERS
        setStudentName(user?.name || "");

        // Check if previous data was deleted/reset by Admin
        if (user?.isDeleted && user?.deletionReason) {
          setDeletionNotice({
            isDeleted: true,
            reason: user.deletionReason,
          });
        } else {
          setDeletionNotice({
            isDeleted: false,
            reason: "",
          });
        }

        // Student verification comes from STUDENTS
        if (result.profileExists && result.data) {
          setTeacherVerified(result.data.teacherVerified === true);
        } else {
          setTeacherVerified(false);
        }
      } catch (error) {
        console.error("Dashboard Student Error:", error);
        setStudentName("");
        setTeacherVerified(false);
      }

      // 2. INTERNSHIP
      try {
        const response = await API.get("/internships/status");
        const internshipData = response.data?.data?.internship;
        if (internshipData) {
          setInternship(internshipData);
          setTotalWeeks(Number(internshipData.totalWeeks) || 0);
          setManagerVerified(internshipData.managerVerified === true);
        } else {
          setInternship(null);
          setTotalWeeks(0);
          setManagerVerified(false);
        }
      } catch {
        setInternship(null);
        setTotalWeeks(0);
        setManagerVerified(false);
      }

      // 3. WEEKLY REPORTS
      try {
        const response = await API.get("/reports");
        const reports = response.data?.data || [];

        setSubmittedReports(reports.length);
        setPendingReports(
          reports.filter((report) => report.status === "Pending").length
        );
        setApprovedReports(
          reports.filter((report) => report.status === "Approved").length
        );
        setRejectedReports(
          reports.filter((report) => report.status === "Rejected").length
        );
      } catch {
        setSubmittedReports(0);
        setPendingReports(0);
        setApprovedReports(0);
        setRejectedReports(0);
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // Completion
  const completion =
    totalWeeks > 0
      ? Math.min(Math.round((submittedReports / totalWeeks) * 100), 100)
      : 0;

  // Internship Status
  let internshipStatus = "No Internship";
  if (internship) {
    switch (internship.status) {
      case "pending":
      case "ongoing":
        internshipStatus = "✔ Active";
        break;
      case "completed":
        internshipStatus = "✔ Completed";
        break;
      case "rejected":
        internshipStatus = "❌ Rejected";
        break;
      default:
        internshipStatus = "No Internship";
    }
  }

  // Student Verification
  let verificationStatus = "NOT VERIFIED";
  let verificationClass = "danger";

  if (teacherVerified && managerVerified) {
    verificationStatus = "VERIFIED";
    verificationClass = "success";
  } else if (teacherVerified || managerVerified) {
    verificationStatus = "PARTIALLY VERIFIED";
    verificationClass = "warning";
  }

  // Loading
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {studentName || "Student"} 👋 </h1>
          <p>Internship Tracking Dashboard</p>
        </div>
      </div>

      {/* ADMIN DELETION NOTICE BANNER */}
      {deletionNotice.isDeleted && deletionNotice.reason && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fed7d7",
            borderLeft: "5px solid #e53e3e",
            borderRadius: "12px",
            padding: "18px 22px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(229, 62, 62, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <h3
              style={{
                margin: 0,
                color: "#9b2c2c",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Account / Record Reset Notice
            </h3>
          </div>
          <p
            style={{
              margin: "0 0 6px 0",
              color: "#2d3748",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <strong>Reason:</strong> {deletionNotice.reason}
          </p>
          <small style={{ color: "#718096", fontSize: "12.5px" }}>
            Your previous internship records and profile were cleared by the
            administrator. Please set up your profile to restart.
          </small>
        </div>
      )}

      {/* Top Cards */}
      <div className="dashboard-cards">
        <div className="status-card">
          <h3>Internship Status</h3>
          <h2
            className={`internship-status ${
              internship?.status || "none"
            }`}
          >
            {internshipStatus}
          </h2>

          {/* SHOW ADMIN REJECTION REASON IF STATUS IS REJECTED */}
          {internship?.status === "rejected" && internship?.rejectionReason && (
            <div
              style={{
                marginTop: "12px",
                background: "#fff5f5",
                border: "1px solid #feb2b2",
                borderLeft: "4px solid #e53e3e",
                borderRadius: "8px",
                padding: "10px 14px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px" }}>❌</span>
                <strong style={{ color: "#9b2c2c", fontSize: "13px" }}>
                  Rejected by Admin
                </strong>
              </div>
              <p style={{ margin: "0 0 4px 0", color: "#2d3748", fontSize: "13px", lineHeight: "1.4" }}>
                <strong>Reason:</strong> {internship.rejectionReason}
              </p>
              {internship.rejectedAt && (
                <small style={{ color: "#718096", fontSize: "11px" }}>
                  Date: {new Date(internship.rejectedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </small>
              )}
            </div>
          )}
        </div>

        <div className="status-card">
          <h3>Current Week</h3>
          <h2>
            {submittedReports} / {totalWeeks}
          </h2>
        </div>
      </div>

      {/* Progress */}
      <div className="dashboard-box">
        <div className="box-title">
          <h3>Overall Progress</h3>
          <span>{completion}%</span>
        </div>

        <div className="progress-container">
          <div
            className="progress-fill"
            style={{ width: `${completion}%` }}
          />
        </div>

        <p className="progress-text">
          {submittedReports} of {totalWeeks} weekly reports submitted.
        </p>
      </div>

      {/* Verification */}
      <div className="dashboard-box">
        <div className="verification-header">
          <h3>Verification</h3>
          <div className="verification-users">
            {/* Teacher verification */}
            <span
              className={teacherVerified ? "verified" : "not-verified"}
            >
              {teacherVerified ? "✔" : "❌"} Teacher
            </span>

            {/* Manager verification */}
            <span
              className={managerVerified ? "verified" : "not-verified"}
            >
              {managerVerified ? "✔" : "❌"} Manager
            </span>
          </div>
        </div>
        <div className={`verification-status ${verificationClass}`}>
          {verificationStatus}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-box">
        <h3>Quick Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <h2>{submittedReports}</h2>
            <p>Submit Total Reports</p>
          </div>

          <div className="stat-item">
            <h2>{pendingReports}</h2>
            <p>Pending</p>
          </div>

          <div className="stat-item">
            <h2>{approvedReports}</h2>
            <p>Approved</p>
          </div>

          <div className="stat-item">
            <h2>{rejectedReports}</h2>
            <p>Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
}