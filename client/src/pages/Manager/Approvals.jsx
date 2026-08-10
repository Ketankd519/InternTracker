import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ManagerStyle.css";

export default function ManagerApprovals() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    //The syntax error show because this function is colling but not using.
    //This is because the new user register function can not fetch the data.
    //If Already register stuent with complete profile the data is fetching and the function is using.
    // so ignore this error.
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await api.get("/manager/students");

      setStudents( response.data.students || []);

    } catch (error) {
      console.error(
        "Manager Students Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load students"
      );

    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed": return "manager-status-completed";
      case "ongoing": return "manager-status-ongoing";
      case "pending": return "manager-status-pending";
      case "rejected": return "manager-status-rejected";
      default: return "manager-status-default";
    }
  };

  if (loading) {
    return (
      <div className="manager-page">
        <div className="manager-loading">
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="manager-page">

          {/* PAGE HEADER */}
      <div className="manager-page-header">
        <div>
          <h1>Student Approvals</h1>
          <p>Review student internship information and verify student records.</p>
        </div>

        <div className="manager-count-badge">
          {students.length} Students
        </div>
      </div>

      {error && (
        <div className="manager-error">
          {error}
        </div>
      )}

          {/* STUDENT TABLE */}
      <div className="manager-table-container">
        <table className="manager-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Company</th>
              <th>Current Week</th>
              <th>Total Weeks</th>
              <th>Status</th>
              <th>Manager Verification</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="manager-empty-table"
                >
                  No students found.
                </td>
              </tr>
            ) : (
              students.map(
                (student, index) => (
                  <tr
                    key={
                      student.studentId ||
                      student.userId
                    }
                  >
                    <td>
                      {index + 1}
                    </td>
                    <td>
                      <strong>
                        {student.name}
                      </strong>
                      <small className="manager-student-email">
                        {student.email}
                      </small>
                    </td>
                    <td>
                      {student.rollNo || "-"}
                    </td>
                    <td>
                      {student.companyName}
                    </td>
                    <td>
                      <strong>
                        Week {student.currentWeek}
                      </strong>
                    </td>
                    <td>
                      {student.totalWeeks || "-"}
                    </td>
                    <td>
                      <span className={
                          `manager-status-badge ${
                            getStatusClass(
                            student.internshipStatus
                            )
                          }`
                        }
                      >
                        {student.internshipStatus}
                      </span>
                    </td>
                    <td>
                      {student.managerVerified ? (
                        <span className="manager-verified-badge">✓ Verified</span>
                      ) : (
                        <span className="manager-not-verified-badge">Not Verified</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="manager-view-btn"
                        onClick={() =>
                          navigate(`/manager/students/${student.studentId}`)}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}