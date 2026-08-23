import { useEffect, useState } from "react";
import API from "../../services/api";
import "./StudentStyle.css";

export default function Progress() {

  // Internship
  const [totalWeeks, setTotalWeeks] = useState(0);

  // Reports
  const [submittedReports, setSubmittedReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [approvedReports, setApprovedReports] = useState(0);
  const [rejectedReports, setRejectedReports] = useState(0);

  // Loading
  const [loading, setLoading] = useState(true);

  // Fetch Progress Data
  useEffect(() => {

    //The syntax error show because this function is colling but not using.
    //This is because the new user register function can not fetch the data.
    //If Already register stuent with complete profile the data is fetching and the function is using.
    // so ignore this error.
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setLoading(true);

    // Reset values first
    setTotalWeeks(0);
    setSubmittedReports(0);
    setPendingReports(0);
    setApprovedReports(0);
    setRejectedReports(0);

    // 1. Fetch Internship
    try {
      const response = await API.get("/internships/status");

      console.log("Progress Internship Response:",
        response.data
      );

      const internshipData = response.data.data?.internship;

      if (internshipData) {
        setTotalWeeks(
          Number(internshipData.totalWeeks) || 0
        );
      } else {
        setTotalWeeks(0);
      }
    } catch {
      // New user may not have internship.
      // This means total weeks = 0.
      setTotalWeeks(0);

      console.log("No internship found for progress.");
    }

    // 2. Fetch Weekly Reports
    try {
      const response = await API.get("/reports");
      console.log("Progress Reports Response:",response.data);
      const reports = response.data.data || [];

      // Total Submitted Reports
      setSubmittedReports(
        reports.length
      );

      // Pending Reports
      const pending =
        reports.filter((report) =>
            report.status === "Pending"
        ).length;

      // Approved Reports
      const approved =
        reports.filter((report) =>
            report.status === "Approved"
        ).length;

      // Rejected Reports
      const rejected =
        reports.filter((report) =>
            report.status === "Rejected"
        ).length;

      setPendingReports(pending);
      setApprovedReports(approved);
      setRejectedReports(rejected);
    } catch {
      // New user may have no reports.
      setSubmittedReports(0);
      setPendingReports(0);
      setApprovedReports(0);
      setRejectedReports(0);

      console.log("No weekly reports found for progress.");
    }
    setLoading(false);
  };

  // Completion
  const completion =
    totalWeeks > 0
      ? Math.min(
          Math.round(
            (submittedReports /
              totalWeeks) *
              100
          ),
          100
        )
      : 0;

    const RScompletion = totalWeeks > 0
        ? Math.min(
            Math.round(
              (approvedReports / totalWeeks ) * 100
            ),
            100
        )
      : 0;

  // Progress Status
  const verificationStatus =
    RScompletion === 100
      ? "Completed"
      : RScompletion >= 50
      ? "In Progress"
      : RScompletion > 0
      ? "Started"
      : "Not Started";

  // Loading Screen
  if (loading) {
    return (
        <div className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <h1>Internship Progress</h1>
              <p>Loading your internship progress...</p>
            </div>
          </div>
        </div>
    );
  }

  // Progress Page
  return (
      <div className="dashboard-page">

            {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Internship Progress</h1>
            <p>Track your internship progress and report status.</p>
          </div>
        </div>

            {/* Summary Cards */}
        <div className="dashboard-cards">
          <div className="status-card">
            <h3>Total Weeks</h3>
            <h2>{totalWeeks}</h2>
          </div>
          <div className="status-card">
            <h3>Submitted Reports</h3>
            <h2>{submittedReports}</h2>
          </div>
          <div className="status-card">
            <h3>Completion</h3>
            <h2 className="active-status">{completion}%</h2>
          </div>
        </div>

            {/* Overall Progress */}
        <div className="dashboard-box">
          <div className="box-title">
            <h3>Overall Progress</h3>
            <span>{completion}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-fill"
              style={{
                width: `${completion}%`,
              }}
            ></div>
          </div>
          <p className="progress-text">
            {submittedReports} of{" "}
            {totalWeeks} weekly
            reports submitted.
          </p>
        </div>

            {/* Statistics */}
        <div className="dashboard-box">
          <h3>Report Statistics</h3>
          <div className="stats-grid">

            {/* Total Reports */}
            <div className="stat-item">
              <h2>{totalWeeks}</h2>
              <p>Total Reports</p>
            </div>
          
            {/* Submitted Reports */}
            <div className="stat-item">
              <h2>{submittedReports}</h2>
              <p>Submitted Reports</p>
            </div>

            {/* Pending Reports */}
            <div className="stat-item">
              <h2>{pendingReports}</h2>
              <p>Pending Reports</p>
            </div>

            {/* Approved Reports */}
            <div className="stat-item">
              <h2>{approvedReports}</h2>
              <p>Approved Reports</p>
            </div>

            {/* Rejected Reports */}
            <div className="stat-item">
              <h2>{rejectedReports}</h2>
              <p>Rejected Reports</p>
            </div>

            {/* Completion */}
            <div className="stat-item">
              <h2>{RScompletion}%</h2>
              <p>Completion</p>
            </div>
          </div>
        </div>
        <div className="dashboard-box">
          <div className="verification-header">
            <h3>Internship Status</h3>
          </div>
          <div
            className={`verification-status ${
              completion === 100
                ? "success"
                : completion >= 50
                ? "info"
                : completion > 0
                ? "warning"
                : "danger"
            }`}
          >
            {verificationStatus}
          </div>
        </div>
      </div>
  );
}