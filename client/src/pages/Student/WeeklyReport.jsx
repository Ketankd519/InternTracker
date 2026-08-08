import { useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import API from "../../services/api";
import "./StudentStyle.css";

export default function WeeklyReport() {
  const [formData, setFormData] = useState({
    weekNumber: "",
    taskTitle: "",
    description: "",
    attachment: null,
    submissionDate: "",
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

  // Submit Weekly Report
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // FormData is required because attachment is a file
      const data = new FormData();

      data.append("weekNumber", formData.weekNumber);
      data.append("taskTitle", formData.taskTitle);
      data.append("description", formData.description);

      if (formData.submissionDate) {
        data.append("submissionDate", formData.submissionDate);
      }

      if (formData.attachment) {
        data.append("attachment", formData.attachment);
      }

      const response = await API.post("/reports", data);

      console.log("Weekly Report Response:", response.data);

      setMessage(
        response.data.message ||
          "Weekly report submitted successfully."
      );

      // Reset form
      setFormData({
        weekNumber: "",
        taskTitle: "",
        description: "",
        attachment: null,
        submissionDate: "",
      });

      // Reset file input
      e.target.reset();
    } catch (err) {
      console.error("Weekly Report Error:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to submit weekly report. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="profile-page">

        {/* Header */}
        <div className="profile-header">
          <h1>Weekly Report</h1>
          <p>
            Submit your internship work completed this week.
          </p>
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

          {/* Weekly Submission */}
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
                required
              />

              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="taskTitle"
                placeholder="Task Title"
                value={formData.taskTitle}
                onChange={handleChange}
                required
              />

              <textarea
                rows="6"
                name="description"
                placeholder="Describe the work completed this week..."
                value={formData.description}
                onChange={handleChange}
                required
              />

              <div className="file-upload">

                <label>
                  Attachment (Optional)
                </label>

                <input
                  type="file"
                  name="attachment"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

          {/* Submit */}
          <div className="profile-buttons">

            <button
              type="submit"
              className="profile-btn"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Report"}
            </button>

          </div>

        </form>

      </div>
    </StudentLayout>
  );
}