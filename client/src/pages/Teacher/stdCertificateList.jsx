import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./TeacherStyle.css";

export default function StdCertificateList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCertificateStudents();
  }, []);

  const fetchCertificateStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/certificates/students");
      setStudents(response.data?.data || []);
    } catch (err) {
      console.error("Certificate Student List Error:", err);
      setError(err.response?.data?.message || "Unable to fetch certificate students.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (studentId) => {
    navigate(`/teacher/student-certificate/${studentId}`);
  };

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
    return approved ? "manager-approved" : "manager-not-approved";
  };

  const getTeacherApprovalClass = (approved) => {
    return approved ? "manager-teacher-approved" : "manager-teacher-not-approved";
  };

  // SEARCH FILTER
  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const studentName =
      student.studentName ||
      student.student?.user?.name ||
      student.name ||
      "";
    const internshipStatus =
      student.internshipStatus ||
      student.internship?.status ||
      "";

    return (
      studentName.toLowerCase().includes(q) ||
      internshipStatus.toLowerCase().includes(q)
    );
  });

  // DISPLAY LIMIT: Maximum 10 items shown
  const displayedStudents = filteredStudents.slice(0, 10);

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

  if (error) {
    return (
      <div className="teacher-certificate-list-page">
        <div className="teacher-certificate-header">
          <h1>Student Certificates</h1>
          <div className="certificate-list-error">
            <p>{error}</p>
            <button onClick={fetchCertificateStudents}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-certificate-list-page">
      {/* HEADER */}
      <div className="teacher-certificate-header">
        <div>
          <h1>Student Certificates</h1>
          <p>Students verified by teacher are displayed below. (Showing max 10 records)</p>
        </div>
        <div className="certificate-student-count">
          Total Students: <strong>{students.length}</strong>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by student name, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        />
        {searchQuery && (
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Found {filteredStudents.length} match{filteredStudents.length === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="teacher-certificate-table-container">
        {displayedStudents.length === 0 ? (
          <div className="no-certificate-students">
            <h3>{searchQuery ? "No Matching Students" : "No Verified Students"}</h3>
            <p>{searchQuery ? "No students match your search criteria." : "No students are currently eligible for certificate processing."}</p>
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
              {displayedStudents.map((student, index) => {
                const studentId = student.studentId || student._id || student.student?._id;
                const studentName =
                  student.studentName ||
                  student.student?.user?.name ||
                  student.name ||
                  "Not Available";
                const internshipStatus =
                  student.internshipStatus ||
                  student.internship?.status ||
                  "pending";
                const managerApproved =
                  student.managerApproved === true ||
                  student.certificate?.managerApproved === true;
                const teacherApproved =
                  student.teacherApproved === true ||
                  student.certificate?.teacherApproved === true;

                return (
                  <tr key={studentId || index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="teacher-certificate-student-name">{studentName}</div>
                    </td>
                    <td>
                      <span className={`internship-status-badge ${getInternshipStatusClass(internshipStatus)}`}>
                        {internshipStatus.charAt(0).toUpperCase() + internshipStatus.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`manager-certificate-badge ${getManagerApprovalClass(managerApproved)}`}>
                        {managerApproved ? "✓ Approved" : "Not Approved"}
                      </span>
                    </td>
                    <td>
                      <span className={`manager-teacher-certificate-status ${getTeacherApprovalClass(teacherApproved)}`}>
                        {teacherApproved ? "✓ Approved" : "Not Approved"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-certificate-btn"
                        onClick={() => handleViewCertificate(studentId)}
                      >
                        View Certificate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}