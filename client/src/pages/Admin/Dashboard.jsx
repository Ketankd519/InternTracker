import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import "./AdminStyle.css";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalManagers: 0,
    activeManagers: 0,
    totalWeeklyReports: 0,
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,

    internshipStatus: {
      ongoing: 0,
      completed: 0,
      pending: 0,
      rejected: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/admin/dashboard");

        setStats(response.data.data);
      } catch (err) {
        console.error("Admin Dashboard Error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Today's Date
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Weekly Report Chart
  const reportTotal =
    stats.totalApproved +
    stats.totalPending +
    stats.totalRejected;

  const reportApprovedPercentage =
    reportTotal > 0
      ? (stats.totalApproved / reportTotal) * 100
      : 0;

  const reportPendingPercentage =
    reportTotal > 0
      ? (stats.totalPending / reportTotal) * 100
      : 0;

  const reportApprovedEnd = reportApprovedPercentage;

  const reportPendingEnd =
    reportApprovedPercentage + reportPendingPercentage;

  // Internship Chart
  const internshipTotal =
    stats.internshipStatus.ongoing +
    stats.internshipStatus.completed +
    stats.internshipStatus.pending +
    stats.internshipStatus.rejected;

  const ongoingPercentage =
    internshipTotal > 0
      ? (stats.internshipStatus.ongoing / internshipTotal) * 100
      : 0;

  const completedPercentage =
    internshipTotal > 0
      ? (stats.internshipStatus.completed / internshipTotal) * 100
      : 0;

  const pendingPercentage =
    internshipTotal > 0
      ? (stats.internshipStatus.pending / internshipTotal) * 100
      : 0;

  const ongoingEnd = ongoingPercentage;

  const completedEnd =
    ongoingPercentage + completedPercentage;

  const pendingEnd =
    ongoingPercentage +
    completedPercentage +
    pendingPercentage;

  return (
    <div className="admin-dashboard">

      {/* ================= HEADER ================= */}
      <div className="admin-dashboard-header">

        <div>
          <h1>
            Welcome, {user?.name || "Admin"} 👋
          </h1>

          <p>
            Here is an overview of your InternTrack portal.
          </p>
        </div>

        <div className="admin-date-card">
          <span className="admin-date-icon">📅</span>

          <div>
            <small>Today</small>
            <strong>{formattedDate}</strong>
          </div>
        </div>

      </div>


      {loading && (
        <div className="admin-dashboard-message">
          Loading dashboard...
        </div>
      )}


      {error && (
        <div className="admin-dashboard-error">
          {error}
        </div>
      )}


      {!loading && !error && (
        <>

          {/* ================= STATISTICS ================= */}
          <div className="admin-stats-grid">

            <div className="admin-stat-card">
              <div className="admin-stat-icon purple">
                👥
              </div>

              <div>
                <p>Total Users</p>
                <h2>{stats.totalUsers}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon blue">
                🎓
              </div>

              <div>
                <p>Total Students</p>
                <h2>{stats.totalStudents}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon green">
                🟢
              </div>

              <div>
                <p>Active Students</p>
                <h2>{stats.activeStudents}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon orange">
                🎓
              </div>

              <div>
                <p>Completed Students</p>
                <h2>{stats.completedStudents}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon red">
                🧑‍🏫
              </div>

              <div>
                <p>Total Teachers</p>
                <h2>{stats.totalTeachers}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon teal">
                👨‍🏫
              </div>

              <div>
                <p>Active Teachers</p>
                <h2>{stats.activeTeachers}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon blue">
                💼
              </div>

              <div>
                <p>Total Managers</p>
                <h2>{stats.totalManagers}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon purple">
                👨‍💼
              </div>

              <div>
                <p>Active Managers</p>
                <h2>{stats.activeManagers}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon blue">
                📄
              </div>

              <div>
                <p>Total Weekly Reports</p>
                <h2>{stats.totalWeeklyReports}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon green">
                ✓
              </div>

              <div>
                <p>Approved Reports</p>
                <h2>{stats.totalApproved}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon orange">
                ⏳
              </div>

              <div>
                <p>Pending Reports</p>
                <h2>{stats.totalPending}</h2>
              </div>
            </div>


            <div className="admin-stat-card">
              <div className="admin-stat-icon red">
                ✕
              </div>

              <div>
                <p>Rejected Reports</p>
                <h2>{stats.totalRejected}</h2>
              </div>
            </div>

          </div>


          {/* ================= CHARTS ================= */}
          <div className="admin-charts-grid">


            {/* WEEKLY REPORTS */}
            <div className="admin-chart-card">

              <div className="admin-chart-header">
                <div>
                  <h2>Weekly Reports Overview</h2>
                  <p>Report status distribution</p>
                </div>
              </div>


              <div className="admin-chart-content">

                <div
                  className="admin-donut"
                  style={{
                    background:
                      reportTotal === 0
                        ? "#e5e7eb"
                        : `conic-gradient(
                            #22c55e 0% ${reportApprovedEnd}%,
                            #f59e0b ${reportApprovedEnd}% ${reportPendingEnd}%,
                            #ef4444 ${reportPendingEnd}% 100%
                          )`,
                  }}
                >
                  <div className="admin-donut-center">
                    <strong>{reportTotal}</strong>
                    <span>Total</span>
                  </div>
                </div>


                <div className="admin-chart-legend">

                  <div className="legend-item">
                    <span className="legend-dot green"></span>

                    <div>
                      <strong>Approved</strong>
                      <small>
                        {stats.totalApproved} (
                        {reportTotal > 0
                          ? Math.round(
                              (stats.totalApproved /
                                reportTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>


                  <div className="legend-item">
                    <span className="legend-dot orange"></span>

                    <div>
                      <strong>Pending</strong>
                      <small>
                        {stats.totalPending} (
                        {reportTotal > 0
                          ? Math.round(
                              (stats.totalPending /
                                reportTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>


                  <div className="legend-item">
                    <span className="legend-dot red"></span>

                    <div>
                      <strong>Rejected</strong>
                      <small>
                        {stats.totalRejected} (
                        {reportTotal > 0
                          ? Math.round(
                              (stats.totalRejected /
                                reportTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>

                </div>

              </div>
            </div>


            {/* INTERNSHIP STATUS */}
            <div className="admin-chart-card">

              <div className="admin-chart-header">
                <div>
                  <h2>Student Internship Status</h2>
                  <p>Current internship distribution</p>
                </div>
              </div>


              <div className="admin-chart-content">

                <div
                  className="admin-donut"
                  style={{
                    background:
                      internshipTotal === 0
                        ? "#e5e7eb"
                        : `conic-gradient(
                            #3b82f6 0% ${ongoingEnd}%,
                            #22c55e ${ongoingEnd}% ${completedEnd}%,
                            #f59e0b ${completedEnd}% ${pendingEnd}%,
                            #8b5cf6 ${pendingEnd}% 100%
                          )`,
                  }}
                >
                  <div className="admin-donut-center">
                    <strong>{internshipTotal}</strong>
                    <span>Total</span>
                  </div>
                </div>


                <div className="admin-chart-legend">

                  <div className="legend-item">
                    <span className="legend-dot blue"></span>

                    <div>
                      <strong>Ongoing</strong>
                      <small>
                        {stats.internshipStatus.ongoing} (
                        {internshipTotal > 0
                          ? Math.round(
                              (stats.internshipStatus.ongoing /
                                internshipTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>


                  <div className="legend-item">
                    <span className="legend-dot green"></span>

                    <div>
                      <strong>Completed</strong>
                      <small>
                        {stats.internshipStatus.completed} (
                        {internshipTotal > 0
                          ? Math.round(
                              (stats.internshipStatus.completed /
                                internshipTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>


                  <div className="legend-item">
                    <span className="legend-dot orange"></span>

                    <div>
                      <strong>Pending</strong>
                      <small>
                        {stats.internshipStatus.pending} (
                        {internshipTotal > 0
                          ? Math.round(
                              (stats.internshipStatus.pending /
                                internshipTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>


                  <div className="legend-item">
                    <span className="legend-dot purple"></span>

                    <div>
                      <strong>Rejected</strong>
                      <small>
                        {stats.internshipStatus.rejected} (
                        {internshipTotal > 0
                          ? Math.round(
                              (stats.internshipStatus.rejected /
                                internshipTotal) *
                                100
                            )
                          : 0}
                        %)
                      </small>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </>
      )}

    </div>
  );
}