import { useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "./StudentStyle.css";

export default function Internship() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",

    managerName: "",
    managerEmail: "",
    managerPhone: "",

    internshipRole: "",
    department: "Computer Applications", // Fetch from Academic Details

    startDate: "",
    endDate: "",

    totalWeeks: "",
    status: "Pending",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          <h1>Internship Details</h1>
          <p>Provide your internship information.</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>

          <div className="profile-section">

            <h2>Company Information</h2>

            <div className="profile-grid">

              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
              />

              <input
                type="text"
                name="internshipRole"
                placeholder="Internship Role"
                value={formData.internshipRole}
                onChange={handleChange}
              />

              <textarea
                rows="4"
                name="companyAddress"
                placeholder="Company Address"
                value={formData.companyAddress}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="profile-section">

            <h2>Manager Details</h2>

            <div className="profile-grid">

              <input
                type="text"
                name="managerName"
                placeholder="Manager Name"
                value={formData.managerName}
                onChange={handleChange}
              />

              <input
                type="email"
                name="managerEmail"
                placeholder="Manager Email"
                value={formData.managerEmail}
                onChange={handleChange}
              />

              <input
                type="text"
                name="managerPhone"
                placeholder="Manager Phone"
                value={formData.managerPhone}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="profile-section">

            <h2>Internship Details</h2>

            <div className="profile-grid">

              <input
                type="text"
                name="department"
                value={formData.department}
                readOnly
              />

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />

              <input
                type="number"
                name="totalWeeks"
                placeholder="Total Weeks"
                value={formData.totalWeeks}
                onChange={handleChange}
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Pending</option>
                <option>Active</option>
                <option>Completed</option>
              </select>

            </div>

          </div>

          <div className="profile-buttons">

            <button
              type="submit"
              className="profile-btn"
            >
              Save Internship
            </button>

          </div>

        </form>

      </div>

    </StudentLayout>
  );
}