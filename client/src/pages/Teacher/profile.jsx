import { useEffect, useState } from "react";
import API from "../../services/api";
import "./TeacherStyle.css";

export default function TeacherProfile() {

  // FORM DATA
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    teacherId: "",
    course: "",
    department: "",
    mobileNo: "",
    experience: "",
    collegeName: "",
  });

  // PROFILE STATE
  const [profileSaved, setProfileSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // COURSE LIST
  const courseList = [
    "BCA",
    "MCA",
    "BBA",
    "MBA",
    "B.Tech",
    "M.Tech",
    "BE",
    "ME",
    "B.Sc",
    "M.Sc",
    "B.Com",
    "M.Com",
    "BA",
    "MA",
    "B.Pharm",
    "M.Pharm",
    "Other",
  ];

  // DEPARTMENT LIST
  const departmentList = [
    "CA-Computer Application",
    "CS-Computer Science",
    "IT-Information Technology",
    "AI-Artificial Intelligence",
    "DS-Data Science",
    "SE-Software Engineering",
    "EL-Electronics",
    "ET-Electronics and Telecommunication",
    "ME-Mechanical Engineering",
    "CE-Civil Engineering",
    "EE-Electrical Engineering",
    "MN-Management",
    "CM-Commerce",
    "SC-Science",
    "AR-Arts",
    "Other",
  ];

  // FETCH TEACHER PROFILE
  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await API.get("/teacher/profile");
      console.log("TEACHER PROFILE RESPONSE:",
        response.data
      );

      const data = response.data;

      // USER COLLECTION DATA
      const user = data.user || {};

      // TEACHER COLLECTION DATA
      const teacher = data.teacher || {};

      // SET ALL DATA
      setFormData({
        name: user.name || "",
        email: user.email || "",
        teacherId: teacher.teacherId || "",
        course: teacher.course || "",
        department: teacher.department || "",
        mobileNo: teacher.mobileNo || "",
        experience:
          teacher.experience !== undefined &&
          teacher.experience !== null
            ? teacher.experience
            : "",
        collegeName: teacher.collegeName || "",
      });

      // CHECK WHETHER TEACHER PROFILE EXISTS
      if (data.profileExists && teacher.teacherId) {
        setProfileSaved(true);
      } else {
        setProfileSaved(false);
      }
    } catch (err) {
      console.error(
        "Teacher Profile Fetch Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load teacher profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT CHANGE

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // VALIDATION
  const validateForm = () => {
    // Course
    if (!formData.course.trim()) {
      setError("Course is required.");
      return false;
    }

    // Department
    if (!formData.department.trim()) {
      setError("Department is required.");
      return false;
    }

    // College
    if (!formData.collegeName.trim()) {
      setError("College Name is required.");
      return false;
    }

    // Mobile
    if (formData.mobileNo.trim()) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.mobileNo.trim())) {
        setError(
          "Mobile number must contain exactly 10 digits."
        );
        return false;
      }
    }

    // Experience
    if (formData.experience !== "") {
      const experienceNumber = Number(
        formData.experience
      );

      if (
        Number.isNaN(experienceNumber) ||
        experienceNumber < 0
      ) {
        setError(
          "Experience must be a valid number."
        );
        return false;
      }
    }
    return true;
  };

  // SAVE / UPDATE PROFILE
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      // VALIDATION
      if (!validateForm()) {
        setSaving(false);
        return;
      }

      // REQUEST DATA
      const requestData = {
        course: formData.course.trim(),
        department: formData.department.trim(),
        mobileNo: formData.mobileNo.trim(),
        experience: formData.experience === "" ? "" : String(formData.experience).trim(),
        collegeName: formData.collegeName.trim(),
      };

      let response;

      // FIRST SAVE
      // POST /api/teacher/profile
      if (!profileSaved) {
        console.log(
          "Creating new teacher profile..."
        );

        response = await API.post(
          "/teacher/profile",
          requestData
        );
      }

      // UPDATE
      // PUT /api/teacher/profile
      else {
        console.log("Updating existing teacher profile...");
        response = await API.put( "/teacher/profile", requestData);
      }

      console.log( "TEACHER PROFILE SAVE RESPONSE:", response.data);
      const data = response.data;

      // TEACHER DATA RETURNED BY BACKEND
      const teacher = data.teacher || {};

      // USER DATA
      const user = data.user || {};

      // UPDATE FORM WITH SERVER DATA
      setFormData((previous) => ({
        ...previous,

        name:user.name || previous.name,
        email:user.email || previous.email,
        teacherId:teacher.teacherId || previous.teacherId,
        course:teacher.course || previous.course,
        department:teacher.department || previous.department,
        mobileNo:teacher.mobileNo !== undefined && teacher.mobileNo !== null
            ? teacher.mobileNo : "",
        experience: teacher.experience !== undefined && teacher.experience !== null
            ? teacher.experience : "",
        collegeName: teacher.collegeName || previous.collegeName,
      }));

      // PROFILE NOW EXISTS
      setProfileSaved(true);

      // SUCCESS MESSAGE
      setMessage(
        data.message ||
          (
            profileSaved
              ? "Teacher profile updated successfully."
              : "Teacher profile saved successfully."
          )
      );
      // SUCCESS ALERT
      alert(
        data.message ||
          (
            profileSaved
              ? "Teacher profile updated successfully."
              : "Teacher profile saved successfully."
          )
      );
    } catch (err) {
      console.error("Teacher Profile Save Error:", err);
      console.error("Backend Response:", err.response?.data);

    setError(
      err.response?.data?.message ||
        "Unable to save teacher profile."
    );  
    alert(
      err.response?.data?.message ||
        "Unable to save teacher profile."
    );
    } finally {
      setSaving(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="teacher-profile-page">
        <div className="profile-page-header">
          <h1>Teacher Profile</h1>
          <p>Manage your teacher profile information.</p>
        </div>
        <div className="teacher-profile-container">
          <p>Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  // PAGE
  return (
    <div className="teacher-profile-page">

          {/* PAGE HEADER */}
      <div className="profile-page-header">
        <h1>Teacher Profile</h1>
        <p>Manage your teacher profile information.</p>
      </div>

          {/* MAIN PROFILE CONTAINER */}
      <div className="teacher-profile-container">

            {/* BASIC INFORMATION */}
        <div className="teacher-profile-section">
          <h2>Basic Information</h2>
          <div className="teacher-profile-form-grid">

                {/* TEACHER NAME */}
            <div className="teacher-profile-form-group">
              <label>Teacher Name</label>
              <input type="text" value={formData.name} readOnly/>
            </div>

                {/* TEACHER EMAIL */}
            <div className="teacher-profile-form-group">
              <label>Teacher Email</label>
              <input type="email" value={formData.email} readOnly/>
            </div>

                {/* TEACHER ID */}
            <div className="teacher-profile-form-group">
              <label>Teacher ID</label>
              <input type="text" className="teacher-profile-id"
                value={formData.teacherId || "Generated after saving"}
                readOnly
              />
            </div>

                {/* MOBILE NUMBER */}
            <div className="teacher-profile-form-group">
              <label>Mobile No
                <span style={{fontWeight: "400", color: "#94a3b8", marginLeft: "5px",}}>
                </span>
              </label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange}
                placeholder="Enter 10 digit mobile number" maxLength="10" disabled={saving}
              />
            </div>

                {/* EXPERIENCE */}
            <div className="teacher-profile-form-group">
              <label>Experience
                <span style={{fontWeight: "400", color: "#94a3b8", marginLeft: "5px",}}>
                  (Optional)
                </span>
              </label>
              <input type="number" name="experience" value={formData.experience}
                onChange={handleChange} placeholder="Experience in years"
                min="0" step="0.1" disabled={saving}
              />
            </div>
          </div>
        </div>

            {/* PROFESSIONAL INFORMATION */}
        <div className="teacher-profile-section">
          <h2>Professional Information</h2>
          <div className="teacher-profile-form-grid">

                {/* COURSE */}
            <div className="teacher-profile-form-group">
              <label>Course</label>
              <select name="course" value={formData.course}
                onChange={handleChange} disabled={saving}
              >
                <option value="">Select Course</option>
                {courseList.map(
                  (course) => (
                    <option
                      key={course}
                      value={course}
                    >
                      {course}
                    </option>
                  )
                )}
              </select>
            </div>

                {/* DEPARTMENT */}
            <div className="teacher-profile-form-group">
              <label>Department</label>
              <select name="department" value={formData.department}
                onChange={handleChange} disabled={saving}
              >
                <option value="">Select Department</option>
                {departmentList.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  )
                )}
              </select>
            </div>

                {/* COLLEGE NAME */}
            <div className="teacher-profile-form-group full-width">
              <label>College Name</label>
              <input type="text" name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="Enter college name"
                disabled={saving}
              />
            </div>
          </div>
        </div>

            {/* SUCCESS MESSAGE */}
        {message && (
          <div className="teacher-profile-message"
            style={{color: "#166534", background: "#dcfce7", border: "1px solid #86efac",}}
          >
            {message}
          </div>
        )}

            {/* ERROR MESSAGE */}
        {error && (
          <div className="teacher-profile-message"
            style={{color: "#991b1b", background: "#fee2e2", border: "1px solid #fca5a5",}}
          >
            {error}
          </div>
        )}

            {/* SAVE / UPDATE BUTTON */}
        <div className="teacher-profile-actions">
          <button type="button" className="teacher-profile-save-btn"
            onClick={handleSubmit} disabled={saving}
          >
            {saving
              ? "Saving..."
              : profileSaved
              ? "Update Profile"
              : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}