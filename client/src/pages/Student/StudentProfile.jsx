import { useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import API from "../../services/api";
import "./StudentStyle.css";

const StudentProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "Tejas Dhanvijay",
    email: "tejas@gmail.com",

    phone: "",
    dob: "",
    gender: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    college: "",
    department: "",
    semester: "",

    rollNo: "",
    enrollmentNumber: "",

    teacherId: "",
    cgpa: "",

    profilePhoto: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit Student Profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      // Personal Details
      data.append("fullName", formData.fullName);
      data.append("phone", formData.phone);
      data.append("dob", formData.dob);
      data.append("gender", formData.gender);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("pincode", formData.pincode);

      // Academic Details
      data.append("college", formData.college);
      data.append("department", formData.department);
      data.append("semester", formData.semester);
      data.append("rollNo", formData.rollNo);
      data.append("enrollmentNumber", formData.enrollmentNumber);
      data.append("cgpa", formData.cgpa);

      // Teacher ID - only send if entered
      if (formData.teacherId.trim() !== "") {
        data.append("teacherId", formData.teacherId);
      }

      // Profile Photo - only send if selected
      if (formData.profilePhoto) {
        data.append("profilePhoto", formData.profilePhoto);
      }

      const response = await API.post("/students/profile", data);

      console.log("Student Profile Response:", response.data);

      setMessage(
        response.data.message || "Student profile created successfully."
      );

      // Reset editable fields after successful submission
      setFormData((prev) => ({
        ...prev,
        phone: "",
        dob: "",
        gender: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        college: "",
        department: "",
        semester: "",
        rollNo: "",
        enrollmentNumber: "",
        teacherId: "",
        cgpa: "",
        profilePhoto: "",
      }));
    } catch (err) {
      console.error("Student Profile Error:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to create student profile. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>Student Profile</h1>
          <p>Complete your personal and academic information.</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >
          {/* =========================
              Personal Details
          ========================== */}

          <div className="profile-section">
            <h2>Personal Details</h2>

            <div className="profile-grid">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                readOnly
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
              />

              <textarea
                rows="4"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <div className="photo-upload">
                <label>Profile Photo</label>

                <input
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* =========================
              Academic Details
          ========================== */}

          <div className="profile-section">
            <h2>Academic Details</h2>

            <div className="profile-grid">
              <input
                type="text"
                name="college"
                placeholder="College"
                value={formData.college}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="semester"
                placeholder="Semester"
                min="1"
                value={formData.semester}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="rollNo"
                placeholder="Roll Number"
                value={formData.rollNo}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="enrollmentNumber"
                placeholder="Enrollment Number"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="teacherId"
                placeholder="Teacher ID (Optional)"
                value={formData.teacherId}
                onChange={handleChange}
              />

              <input
                type="number"
                step="0.01"
                name="cgpa"
                placeholder="CGPA"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* =========================
              Submit Button
          ========================== */}

          <div className="profile-buttons">
            <button
              type="submit"
              className="profile-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;