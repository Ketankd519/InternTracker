import { useState } from "react";
import "./StudentStyle.css";
import StudentLayout from "../../layouts/StudentLayout";


const StudentProfile = () => {
  const [formData, setFormData] = useState({
    studentName: "Ketan Dhanvijay", // fetched from user
    email: "ketan@gmail.com", // fetched from user

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

    rollNumber: "",
    teacherName: "",
    teacherId: "",

    cgpa: "",
    skills: "",

    profilePhoto: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // API Call
  };

 return (
    <StudentLayout>

      <div className="profile-page">

      <div className="profile-header">
        <h1>Student Profile</h1>
        <p>Complete your personal and academic information.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>

        {/* Personal Details */}

        <div className="profile-section">

          <h2>Personal Details</h2>

          <div className="profile-grid">

            <input
              type="text"
              name="studentName"
              value={formData.studentName}
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
            />

            <input
              type="date"
              name="dob"
              placeholder="DOB"
              value={formData.dob}
              onChange={handleChange}
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
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

        {/* Academic Details */}

        <div className="profile-section">

          <h2>Academic Details</h2>

          <div className="profile-grid">

            <input
              type="text"
              name="college"
              placeholder="College"
              value={formData.college}
              onChange={handleChange}
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
            />

            <input
              type="text"
              name="semester"
              placeholder="Semester"
              value={formData.semester}
              onChange={handleChange}
            />

            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number"
              value={formData.rollNumber}
              onChange={handleChange}
            />

            <input
              type="text"
              name="teacherName"
              placeholder="Teacher Name"
              value={formData.teacherName}
              onChange={handleChange}
            />

            <input
              type="text"
              name="teacherId"
              placeholder="Teacher ID"
              value={formData.teacherId}
              onChange={handleChange}
            />

            <input
              type="number"
              step="0.01"
              name="cgpa"
              placeholder="CGPA"
              value={formData.cgpa}
              onChange={handleChange}
            />

            <textarea
              rows="4"
              name="skills"
              placeholder="Skills (Optional)"
              value={formData.skills}
              onChange={handleChange}
            />

          </div>

        </div>

        <div className="profile-buttons">

          <button type="submit" className="profile-btn">
            Save Profile
          </button>

        </div>

      </form>

    </div>
    </StudentLayout>
  );
};

export default StudentProfile;