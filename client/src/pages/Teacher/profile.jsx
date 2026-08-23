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
    signature: "",
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
        signature: teacher.signature || "",
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
  const { name, value, files } = e.target;

  // MOBILE NUMBER VALIDATION
  if (name === "mobileNo") {
    // Allow only numbers and maximum 10 digits
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 10);

    setFormData((previous) => ({
      ...previous,
      mobileNo: onlyNumbers,
    }));

    setMessage("");
    setError("");
    return;
  }

  setFormData((previous) => ({
    ...previous,
    [name]: files ? files[0] : value,
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
const mobileNumber = formData.mobileNo.trim();

if (!mobileNumber) {
  setError("Mobile number is required.");
  return false;
}

const mobileRegex = /^[0-9]{10}$/;

if (!mobileRegex.test(mobileNumber)) {
  setError("Mobile number must contain exactly 10 digits.");
  return false;
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

    // ==========================================
    // CREATE FORM DATA
    // ==========================================

    const data = new FormData();

    data.append(
      "course",
      formData.course.trim()
    );

    data.append(
      "department",
      formData.department.trim()
    );

    data.append(
      "mobileNo",
      formData.mobileNo.trim()
    );

    data.append(
      "experience",
      formData.experience === ""
        ? ""
        : String(formData.experience).trim()
    );

    data.append(
      "collegeName",
      formData.collegeName.trim()
    );

    // ==========================================
    // TEACHER SIGNATURE
    // ==========================================

    if (formData.signature instanceof File) {
      data.append(
        "signature",
        formData.signature
      );
    }

    let response;

    // ==========================================
    // CREATE PROFILE
    // ==========================================

    if (!profileSaved) {
      console.log(
        "Creating new teacher profile..."
      );

      response = await API.post(
        "/teacher/profile",
        data
      );
    }

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    else {
      console.log(
        "Updating existing teacher profile..."
      );

      response = await API.put(
        "/teacher/profile",
        data
      );
    }

    console.log(
      "TEACHER PROFILE SAVE RESPONSE:",
      response.data
    );

    const responseData = response.data;

    // ==========================================
    // BACKEND DATA
    // ==========================================

    const teacher =
      responseData.teacher || {};

    const user =
      responseData.user || {};

    // ==========================================
    // UPDATE FORM WITH SERVER DATA
    // ==========================================

    setFormData((previous) => ({
      ...previous,

      name:
        user.name ||
        previous.name,

      email:
        user.email ||
        previous.email,

      teacherId:
        teacher.teacherId ||
        previous.teacherId,

      course:
        teacher.course ||
        previous.course,

      department:
        teacher.department ||
        previous.department,

      mobileNo:
        teacher.mobileNo !== undefined &&
        teacher.mobileNo !== null
          ? teacher.mobileNo
          : "",

      experience:
        teacher.experience !== undefined &&
        teacher.experience !== null
          ? teacher.experience
          : "",

      collegeName:
        teacher.collegeName ||
        previous.collegeName,

      // IMPORTANT
      signature:
        teacher.signature ||
        previous.signature,
    }));

    // ==========================================
    // PROFILE EXISTS
    // ==========================================

    setProfileSaved(true);

    // ==========================================
    // SUCCESS MESSAGE
    // ==========================================

    const successMessage =
      responseData.message ||
      (
        profileSaved
          ? "Teacher profile updated successfully."
          : "Teacher profile saved successfully."
      );

    setMessage(successMessage);

    alert(successMessage);

  } catch (err) {

    console.error(
      "Teacher Profile Save Error:",
      err
    );

    console.error(
      "Backend Response:",
      err.response?.data
    );

    const errorMessage =
      err.response?.data?.message ||
      "Unable to save teacher profile.";

    setError(errorMessage);

    alert(errorMessage);

  } finally {

    setSaving(false);

  }
};

function getSignatureUrl(signature) {
  if (!signature) {
    return null;
  }

  // Already complete URL
  if (
    signature.startsWith("http://") ||
    signature.startsWith("https://")
  ) {
    return signature;
  }

  // Normalize Windows path
  const cleanPath = signature
    .replace(/\\/g, "/")
    .replace(/^uploads\//, "");

  return `http://localhost:5000/uploads/${cleanPath}`;
}

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
      <div className="profile-page-header">
        <h1>Teacher Profile</h1>
        <p>Manage your teacher profile information.</p>
      </div>

      <div className="teacher-profile-container">

        <div className="teacher-profile-section">
          <h2>Basic Information</h2>

          <div className="teacher-profile-form-grid">

            <div className="teacher-profile-form-group">
              <label>Teacher Name</label>
              <input type="text" value={formData.name} readOnly/>
            </div>

            <div className="teacher-profile-form-group">
              <label>Teacher Email</label>
              <input type="email" value={formData.email} readOnly/>
            </div>

            <div className="teacher-profile-form-group">
              <label>Teacher ID</label>
              <input type="text" className="teacher-profile-id"
                value={formData.teacherId || "Generated after saving"}
                readOnly
              />
            </div>

            <div className="teacher-profile-form-group">
              <label>Mobile No
                <span style={{fontWeight: "400", color: "#94a3b8", marginLeft: "5px",}}>
                </span>
              </label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required
                placeholder="Enter 10 digit mobile number" maxLength={10} inputMode="numeric"
                pattern="[0-9]{10}" disabled={saving}
              />
            </div>

            {/* <div className="teacher-signature-section"> */}
              <div className="teacher-signature-upload">
                <label htmlFor="signature">Teacher Signature</label>

                  <div className="teacher-signature-preview">
                    {formData.signature ? (
                    <img
                      src={
                        formData.signature instanceof File
                          ? URL.createObjectURL(formData.signature)
                          : getSignatureUrl(formData.signature)
                      }
                      alt="Teacher Signature"
                    />
                    ) : (
                      <span>No signature uploaded</span>
                    )}
                  </div>

                  <input
                    type="file" id="signature" name="signature"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleChange} required
                  />

                  <small>Recommended format: PNG (transparent background).</small>
                <div className="teacher-signature-instructions-IMP">
                  <strong>Signature Guidelines:</strong>
                     ✍️ Use a 0.7–1.0 mm black/dark-blue pen, remove the<br/> background,
                     and upload a clear transparent PNG. This signature will be displayed<br/> on the certificate.
                </div>
            </div>

          <div className="teacher-signature-instructions">
            <strong>Signature Guidelines:</strong>
              <div className="signature-sample-image">
                <img
                  src="/images/signature-guidelines.png"
                  alt="Accepted and Not Accepted signature examples"
                />
              </div>
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
                onChange={handleChange} required disabled={saving}
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
                onChange={handleChange} required disabled={saving}
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
            <div className="teacher-profile-form-group ">
              <label>College Name</label>
              <input type="text" name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="Enter college name"
                disabled={saving}
                required
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