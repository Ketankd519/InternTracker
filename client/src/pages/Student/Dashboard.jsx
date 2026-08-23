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

        // Student verification comes from STUDENTS
        if (result.profileExists && result.data) {
          setTeacherVerified(
            result.data.teacherVerified === true
          );
        } else {
          setTeacherVerified(false);
        }
      } catch (error) {
        console.error("Dashboard Student Error:", error);

        // Safe default for new user
        setStudentName("");
        setTeacherVerified(false);
      }

      // 2. INTERNSHIP
      try {
        const response = await API.get("/internships/status");
        const internshipData = response.data?.data?.internship;

        if (internshipData) {
          setInternship(internshipData);

          setTotalWeeks(
            Number(internshipData.totalWeeks) || 0
          );

          // Manager verifies internship
          setManagerVerified(
            internshipData.managerVerified === true
          );
        } else {
          setInternship(null);
          setTotalWeeks(0);
          setManagerVerified(false);
        }
      } catch {
        // No internship is normal for a new student
        setInternship(null);
        setTotalWeeks(0);
        setManagerVerified(false);

        console.log("No internship found.");
      }

      // 3. WEEKLY REPORTS
      try {
        const response = await API.get("/reports");
        const reports = response.data?.data || [];

        // Total submitted
        setSubmittedReports(reports.length);

        // Pending
        setPendingReports(
          reports.filter(
            (report) => report.status === "Pending"
          ).length
        );

        // Approved
        setApprovedReports(
          reports.filter(
            (report) => report.status === "Approved"
          ).length
        );

        // Rejected
        setRejectedReports(
          reports.filter(
            (report) => report.status === "Rejected"
          ).length
        );
      } catch  {
        // New user = zero reports
        setSubmittedReports(0);
        setPendingReports(0);
        setApprovedReports(0);
        setRejectedReports(0);

        console.log("No weekly reports found.");
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Completion
  const completion =
    totalWeeks > 0
      ? Math.min(
          Math.round(
            (submittedReports / totalWeeks) * 100
          ),
          100
        )
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
  // Teacher + Manager

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
          <div><h1>Welcome, {studentName || "Student"} 👋 </h1>
            <p>Internship Tracking Dashboard</p>
          </div>
        </div>

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
          </div>

          <div className="status-card">
            <h3>Current Week</h3>
            <h2> {submittedReports} / {totalWeeks} </h2>
          </div>
        </div>

            {/* Progress */}
        <div className="dashboard-box">
          <div className="box-title">
            <h3>Overall Progress</h3>
            <span> {completion}% </span>
          </div>

          <div className="progress-container">
            <div className="progress-fill"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>

          <p className="progress-text">
            {submittedReports} of {totalWeeks} weekly
            reports submitted.
          </p>
        </div>

            {/* Verification */}
        <div className="dashboard-box">
          <div className="verification-header">
            <h3>Verification</h3>
            <div className="verification-users">

              {/* Teacher verification */}
              <span
                className={
                  teacherVerified
                    ? "verified"
                    : "not-verified"
                }
              >
                {teacherVerified ? "✔" : "❌"} Teacher
              </span>

              {/* Manager verification */}
              <span
                className={
                  managerVerified
                    ? "verified"
                    : "not-verified"
                }
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