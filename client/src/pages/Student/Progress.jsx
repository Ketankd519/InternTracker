import StudentLayout from "../../layouts/StudentLayout";
import "./StudentStyle.css";

export default function Progress() {

  // Temporary data
  // Later these values will come from backend APIs

  const totalWeeks = 12;
  const submittedReports = 8;
  const approvedReports = 4;
  const pendingReports = 4;
  const rejectedReports = 2;

  const completion = Math.round(
    (submittedReports / totalWeeks) * 100
  );

  const verificationStatus =
    completion === 100
      ? "Completed"
      : completion >= 50
      ? "In Progress"
      : "Started";

  return (
    <StudentLayout>

      <div className="dashboard-page">

        {/* Header */}

        <div className="dashboard-header">

          <div>
            <h1>Internship Progress</h1>
            <p>
              Track your internship progress and report status.
            </p>
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
            <h2 className="active-status">
              {completion}%
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
              style={{
                width: `${completion}%`,
              }}
            ></div>
          </div>

          <p className="progress-text">
            {submittedReports} of {totalWeeks} weekly
            reports submitted.
          </p>

        </div>

        {/* Statistics */}

        <div className="dashboard-box">

          <h3>Report Statistics</h3>

          <div className="stats-grid">

            <div className="stat-item">
              <h2>{submittedReports}</h2>
              <p>Total Reports</p>
            </div>

            <div className="stat-item">
              <h2>{submittedReports}</h2>
              <p>Submitted Reports</p>
            </div>

            <div className="stat-item">
              <h2>{pendingReports}</h2>
              <p>Pending Reports</p>
            </div>

            <div className="stat-item">
              <h2>{approvedReports}</h2>
              <p>Approved Reports</p>
            </div>

            <div className="stat-item">
              <h2>{rejectedReports}</h2>
              <p>Rejected Reports</p>
            </div>

            <div className="stat-item">
              <h2>{completion}%</h2>
              <p>Completion</p>
            </div>

          </div>

        </div>

        {/* Verification */}

        <div className="dashboard-box">

          <div className="verification-header">

            <h3>Verification Status</h3>

          </div>

          <div
            className={`verification-status ${
              completion === 100
                ? "success"
                : completion >= 50
                ? "warning"
                : "danger"
            }`}
          >
            {verificationStatus}
          </div>

        </div>

      </div>

    </StudentLayout>
  );
}