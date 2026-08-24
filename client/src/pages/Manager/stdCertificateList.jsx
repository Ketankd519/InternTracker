import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./ManagerStyle.css";

export default function StdCertificateList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificateStudents();
  }, []);

  // FETCH CERTIFICATE STUDENTS
  const fetchCertificateStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/certificates/students");
      setStudents(response.data?.data || []);
    } catch (err) {
      console.error("Manager Certificate List Error:",err);
      setError(err.response?.data?.message || "Unable to fetch certificate students.");
    } finally {
      setLoading(false);
    }
  };

  // VIEW CERTIFICATE
  const handleViewCertificate = (studentId) => {

    if (!studentId) {
      console.error("Student ID is missing");
      return;
    }
    navigate(`/manager/student-certificate/${studentId}`);
  };


  // INTERNSHIP STATUS CLASS
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "manager-status-completed";
      case "ongoing": return "manager-status-ongoing";
      case "pending": return "manager-status-pending";
      case "rejected": return "manager-status-rejected";
      default: return "manager-status-pending";
    }
  };

  // TEACHER APPROVAL CLASS
  const getTeacherApprovalClass = (approved) => {
    return approved
      ? "manager-teacher-approved"
      : "manager-teacher-not-approved";
  };

  // LOADING
  if (loading) {
    return (
      <div className="manager-certificate-page">
        <div className="manager-certificate-header">
          <h1>Student Certificates</h1>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="manager-certificate-page">
        <div className="manager-certificate-header">
          <h1>Student Certificates</h1>
          <div className="manager-certificate-error">
            <p>{error}</p>
            <button onClick={fetchCertificateStudents}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAGE
  return (
    <div className="manager-certificate-page">
      
      {/* HEADER */}
      <div className="manager-certificate-header">
        <div>
          <h1>Student Certificates</h1>
          <p>Students verified by manager are displayed below.</p>
        </div>
        <div className="manager-certificate-count">
          Total Students:{" "}
          <strong>{students.length}</strong>
        </div>
      </div>

      {/* TABLE */}
      <div className="manager-certificate-table-container">
        {students.length === 0 ? (
          <div className="manager-no-certificates">
            <h3>No Verified Students</h3>
            <p>No students are currently available for certificate processing.</p>
          </div>
        ) : (
          <table className="manager-certificate-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Student Name</th>
                <th>Internship Status</th>
                <th>Teacher Certificate Approval</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {

                  /*
                   * Backend currently returns:
                   *
                   * studentId
                   * studentName
                   * internshipStatus
                   * teacherApproved
                   * managerApproved
                   * progress
                   */

                  const studentId = student.studentId || student._id || student.student?._id;
                  const studentName = student.studentName || student.student?.user?.name || student.name ||
                    "Not Available";
                  const internshipStatus =student.internshipStatus || student.internship?.status ||
                    "pending";
                  const teacherApproved = student.teacherApproved === true || student.certificate
                    ?.teacherApproved === true;

                  return (
                    <tr key={ studentId || index}>
                      
                      {/* SR NO */}
                      <td>{index + 1}</td>

                      {/* STUDENT NAME */}
                      <td>
                        <div className="manager-student-name">{studentName}</div>
                      </td>

                      {/* INTERNSHIP STATUS */}
                      <td>
                        <span className={`manager-internship-status ${getStatusClass(internshipStatus)}`}>
                          {internshipStatus
                            .charAt(0)
                            .toUpperCase() +
                            internshipStatus.slice(1)}
                        </span>
                      </td>

                      {/* TEACHER APPROVAL */}
                      <td>
                        <span className={`manager-teacher-certificate-status ${getTeacherApprovalClass(teacherApproved)}`}>
                          {teacherApproved
                            ? "✓ Approved"
                            : "Not Approved"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td>
                        <button className="manager-view-certificate-btn" onClick={() =>
                            handleViewCertificate(studentId)
                          }
                          disabled={!studentId}
                        >
                          View Certificate
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}