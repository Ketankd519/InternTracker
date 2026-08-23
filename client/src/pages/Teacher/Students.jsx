import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./TeacherStyle.css";

export default function TeacherStudents() {
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

      const response = await api.get("/teacher/students");

      setStudents(response.data.students || []);

    } catch (error) {
      console.error("Students Error:", error);

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
      case "completed":
        return "status-completed";

      case "ongoing":
        return "status-ongoing";

      case "pending":
        return "status-pending";

      case "rejected":
        return "status-rejected";

      default:
        return "status-default";
    }
  };




  if (loading) {
    return (
      <div className="teacher-page">
        <div className="teacher-loading">
          Loading students...
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-page">

      {/* Header */}
      <div className="teacher-page-header">

        <div>
          <h1>Students</h1>
          <p>
            View all students and their internship progress.
          </p>
        </div>

        <div className="student-count-badge">
          {students.length} Students
        </div>

      </div>


      {error && (
        <div className="teacher-error">
          {error}
        </div>
      )}


      {/* Table */}
      <div className="teacher-table-container">

        <table className="teacher-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Company</th>
              <th>Current Week</th>
              <th>Total Weeks</th>
              <th>Status</th>
              <th>Manager Verification</th>
              <th>Teacher Verification</th>
              <th>Action</th>
            </tr>
          </thead>


          <tbody>

            {students.length === 0 ? (

              <tr>
                <td colSpan="9" className="empty-table">
                  No students found.
                </td>
              </tr>

            ) : (

              students.map((student, index) => (

                <tr key={student.studentId || student.userId}>

                  <td>
                    {index + 1}
                  </td>

                  <td>
                    <strong>
                      {student.name}
                    </strong>

                    <small className="student-email">
                      {student.email}
                    </small>
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
                    <span
                      className={`status-badge ${getStatusClass(
                        student.internshipStatus
                      )}`}
                    >
                      {student.internshipStatus}
                    </span>
                  </td>


                    <td>
                      {student.managerVerified ? (
                        <span className="verified-badge">✓ Verified</span>
                      ) : (
                        <span className="not-verified-badge">Not Verified</span>
                      )}
                    </td>


                  <td>

                    {student.teacherVerified ? (

                      <span className="verified-badge">
                        ✓ Verified
                      </span>

                    ) : (

                      <span className="not-verified-badge">
                        Not Verified
                      </span>

                    )}

                  </td>

                  <td>

                    <button
                      className="view-student-btn"
                      onClick={() =>
                        navigate(
                          `/teacher/students/${student.studentId}`
                        )
                      }
                    >
                      View Profile
                    </button>

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