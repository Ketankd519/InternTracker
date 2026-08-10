import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ManagerStyle.css";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    totalWeeklyReports: 0,
    pendingWeeklyReports: 0,
    approvedWeeklyReports: 0,
    rejectedWeeklyReports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    //The syntax error show because this function is colling but not using.
    //This is because the new user register function can not fetch the data.
    //If Already register stuent with complete profile the data is fetching and the function is using.
    // so ignore this error.
    fetchDashboard();

  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/manager/dashboard");

      setManager(response.data.manager);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Manager Dashboard Error:",error);
      setError( error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-page">
        <div className="manager-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="manager-page">
      {error && (
        <div className="manager-error">
          {error}
        </div>
      )}

          {/* WELCOME */}
      <div className="manager-welcome">
        <div>
          <h1> Welcome,{" "}
            {manager?.name || "Manager"} 👋
          </h1>
          <p>Here is an overview of students, internships and weekly reports.</p>
        </div>
      </div>

          {/* STUDENT STATISTICS */}
      <div className="manager-stat-grid">
        <div className="manager-stat-card">
          <div className="manager-stat-icon">👨‍🎓 </div>

          <div>

            <p>Total Students</p>

            <h2>
              {statistics.totalStudents}
            </h2>

          </div>

        </div>



        <div className="manager-stat-card">

          <div className="manager-stat-icon">
            📚
          </div>

          <div>

            <p>Active Students</p>

            <h2>
              {statistics.activeStudents}
            </h2>

          </div>

        </div>



        <div className="manager-stat-card">

          <div className="manager-stat-icon">
            ✅
          </div>

          <div>

            <p>Completed</p>

            <h2>
              {statistics.completedStudents}
            </h2>

          </div>

        </div>


      </div>



      {/* =====================================
          WEEKLY REPORT STATISTICS
      ===================================== */}

      <div className="manager-section">

        <div className="manager-section-header">

          <div>

            <h2>
              Weekly Report Overview
            </h2>

            <p>
              Current weekly report evaluation status.
            </p>

          </div>

        </div>


        <div className="manager-report-stat-grid">


          <div className="manager-report-card">

            <span>📄</span>

            <div>

              <p>Total Weekly Reports</p>

              <h2>
                {statistics.totalWeeklyReports}
              </h2>

            </div>

          </div>



          <div className="manager-report-card pending">

            <span>⏳</span>

            <div>

              <p>Pending Approval</p>

              <h2>
                {statistics.pendingWeeklyReports}
              </h2>

            </div>

          </div>



          <div className="manager-report-card approved">

            <span>✓</span>

            <div>

              <p>Approved</p>

              <h2>
                {statistics.approvedWeeklyReports}
              </h2>

            </div>

          </div>



          <div className="manager-report-card rejected">

            <span>✕</span>

            <div>

              <p>Rejected</p>

              <h2>
                {statistics.rejectedWeeklyReports}
              </h2>

            </div>

          </div>


        </div>

      </div>



      {/* =====================================
          QUICK ACTIONS
      ===================================== */}

      <div className="manager-section">

        <div className="manager-section-header">

          <h2>
            Quick Access
          </h2>

        </div>


        <div className="manager-quick-grid">


          <button
            className="manager-quick-card"
            onClick={() =>
              navigate("/manager/approvals")
            }
          >

            <span>📋</span>

            <div>

              <h3>
                Student Approvals
              </h3>

              <p>
                Review student internship information
                and verify student records.
              </p>

            </div>

          </button>



          <button
            className="manager-quick-card"
            onClick={() =>
              navigate("/manager/evaluation")
            }
          >

            <span>📝</span>

            <div>

              <h3>
                Weekly Evaluation
              </h3>

              <p>
                Review, approve or reject weekly reports.
              </p>

            </div>

          </button>


        </div>

      </div>


    </div>

  );

}