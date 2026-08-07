import StudentLayout from "../../layouts/StudentLayout";
import "./StudentStyle.css";

export default function Dashboard() {
  return (
    <StudentLayout>

      <div className="dashboard-page">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome, Ketan 👋</h1>
            <p>Internship Tracking Dashboard</p>
          </div>
        </div>

        {/* Top Cards */}
        <div className="dashboard-cards">

          <div className="status-card">
            <h3>Internship Status</h3>
            <h2 className="active-status">✔ Active</h2>
          </div>

          <div className="status-card">
            <h3>Current Week</h3>
            <h2>4 / 12</h2>
          </div>

        </div>

        {/* Progress */}
        <div className="dashboard-box">

          <div className="box-title">
            <h3>Progress</h3>
            <span>35%</span>
          </div>

          <div className="progress-container">
            <div
              className="progress-fill"
              style={{ width: "35%" }}
            ></div>
          </div>

        </div>

        {/* Verification */}
        <div className="dashboard-box">

          <div className="verification-header">

            <h3>Verification</h3>

            <div className="verification-users">
              <span className="verified">✔ Teacher</span>
              <span className="not-verified">✖ Manager</span>
            </div>

          </div>

          <div className="verification-status warning">
            PARTIALLY VERIFIED
          </div>

        </div>

        {/* Quick Stats */}
        <div className="dashboard-box">

          <h3>Quick Stats</h3>

          <div className="stats-grid">

            <div className="stat-item">
              <h2>4</h2>
              <p>Total Reports</p>
            </div>

            <div className="stat-item">
              <h2>1</h2>
              <p>Pending</p>
            </div>

            <div className="stat-item">
              <h2>3</h2>
              <p>Approved</p>
            </div>

            <div className="stat-item">
              <h2>0</h2>
              <p>Rejected</p>
            </div>

          </div>

        </div>

      </div>

    </StudentLayout>
  );
}