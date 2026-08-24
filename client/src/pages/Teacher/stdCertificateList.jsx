import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./TeacherStyle.css";

export default function StdCertificateList() {

  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificateStudents();
  }, []);

  // FETCH STUDENTS
  const fetchCertificateStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response =  await API.get("/certificates/students");
      setStudents(response.data?.data || []);
    } catch (err) {
      console.error("Certificate Student List Error:",err);

      setError(err.response?.data?.message || "Unable to fetch certificate students.");
    } finally {
      setLoading(false);
    }
  };

  // VIEW CERTIFICATE
  const handleViewCertificate = (studentId) => {
    navigate(`/teacher/student-certificate/${studentId}`);
  };

  // STATUS
  const getInternshipStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "certificate-status-completed";
      case "ongoing": return "certificate-status-ongoing";
      case "pending": return "certificate-status-pending";
      case "rejected": return "certificate-status-rejected";
      default: return "certificate-status-pending";
    }
  };

  const getManagerApprovalClass = (approved) => {
    return approved
      ? "manager-approved"
      : "manager-not-approved";
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
      <div className="teacher-certificate-list-page">
        <div className="teacher-certificate-header">
          <h1>Student Certificates</h1>
          <p>Loading verified students...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="teacher-certificate-list-page">
        <div className="teacher-certificate-header">
          <h1>Student Certificates</h1>
          <div className="certificate-list-error">
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
    <div className="teacher-certificate-list-page">
      {/* HEADER */}
      <div className="teacher-certificate-header">
        <div>
          <h1>Student Certificates</h1>
          <p>Students verified by teacher are displayed below.</p>
        </div>
        <div className="certificate-student-count">
          Total Students:{" "}
          <strong>
            {students.length}
          </strong>
        </div>
      </div>

      {/* TABLE */}
      <div className="teacher-certificate-table-container">
        {students.length === 0 ? (
          <div className="no-certificate-students">
            <h3>No Verified Students</h3>
            <p>No students are currently eligible for certificate processing.</p>
          </div>
        ) : (
          <table className="teacher-certificate-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Student Name</th>
                <th>Internship Status</th>
                <th>Manager Certificate</th>
                <th>Teacher Certificate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(
                (student, index) => {
                  /*
                   * Backend may return different
                   * structures depending on
                   * populate().
                   */
                  const studentId = student.studentId || student._id || student.student?._id;
                  const studentName = student.studentName || student.student?.user?.name || student.name ||
                    "Not Available";
                  const internshipStatus = student.internshipStatus || student.internship?.status ||
                    "pending";
                  const managerApproved = student.managerApproved === true || student.certificate?.managerApproved === true;
                  const teacherApproved = student.teacherApproved === true || student.certificate?.teacherApproved === true;
                  return (
                    <tr key={studentId || index}>
                      {/* SR NO */}
                      <td>{index + 1}</td>

                      {/* STUDENT */}
                      <td>
                        <div className="teacher-certificate-student-name">
                          {studentName}
                        </div>
                      </td>

                      {/* INTERNSHIP */}
                      <td>
                        <span className={`internship-status-badge ${getInternshipStatusClass(internshipStatus)}`}>
                          {internshipStatus
                            .charAt(0)
                            .toUpperCase() +
                            internshipStatus.slice(
                              1
                            )}
                        </span>
                      </td>

                      {/* MANAGER APPROVAL */}
                      <td>
                        <span className={`manager-certificate-badge ${getManagerApprovalClass(managerApproved)}`}>
                          {managerApproved
                            ? "✓ Approved"
                            : "Not Approved"}
                        </span>
                      </td>

                      {/* TEACHER APPROVAL */}
                       <td>
                        <span className={`manager-teacher-certificate-status ${getTeacherApprovalClass(teacherApproved)}`}
                        >
                          {teacherApproved
                            ? "✓ Approved"
                            : "Not Approved"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td>
                        <button className="view-certificate-btn" onClick={() =>
                            handleViewCertificate(studentId)
                          }
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