import { useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "./StudentStyle.css";

export default function WeeklyReport() {
  const [formData, setFormData] = useState({
    weekNumber: "",
    taskTitle: "",
    description: "",
    attachment: null,
    submissionDate: "",
    status: "Pending",
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
          <h1>Weekly Report</h1>
          <p>Submit your internship work completed this week.</p>
        </div>

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          <div className="profile-section">

            <h2>Weekly Submission</h2>

            <div className="profile-grid">

              <input
                type="number"
                name="weekNumber"
                placeholder="Week Number"
                min="1"
                value={formData.weekNumber}
                onChange={handleChange}
              />

              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
              />

              <input
                type="text"
                name="taskTitle"
                placeholder="Task Title"
                value={formData.taskTitle}
                onChange={handleChange}
              />

              <textarea
                rows="6"
                name="description"
                placeholder="Describe the work completed this week..."
                value={formData.description}
                onChange={handleChange}
              />

              <div className="file-upload">

                <label>
                  Attachment (Optional)
                </label>

                <input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

          <div className="profile-buttons">

            <button
              type="submit"
              className="profile-btn"
            >
              Submit Report
            </button>

          </div>

        </form>

      </div>

    </StudentLayout>
  );
}