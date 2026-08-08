import { useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import API from "../../services/api";

export default function Internship() {
  const [formData, setFormData] = useState({
    companyName: "",
    internshipRole: "",
    companyAddress: "",

    managerName: "",
    managerEmail: "",
    managerPhone: "",

    department: "Computer Applications",

    startDate: "",
    endDate: "",

    totalWeeks: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Internship
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Data required by backend Internship model/controller
    const data = {
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      internshipRole: formData.internshipRole,

      managerName: formData.managerName,
      managerEmail: formData.managerEmail,
      managerPhone: formData.managerPhone,

      department: formData.department,

      startDate: formData.startDate,
      endDate: formData.endDate,
      totalWeeks: Number(formData.totalWeeks),
    };

      const response = await API.post("/internships", data);

      console.log("Internship Response:", response.data);

      setMessage(
        response.data.message ||
          "Internship application submitted successfully."
      );

      // Reset form after successful submission
      setFormData({
        companyName: "",
        internshipRole: "",
        companyAddress: "",

        managerName: "",
        managerEmail: "",
        managerPhone: "",

        department: "Computer Applications",

        startDate: "",
        endDate: "",

        totalWeeks: "",
        status: "Pending",
      });
    } catch (err) {
      console.error("Internship Error:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to submit internship application.";

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
          <h1>Internship</h1>
          <p>Enter your internship details.</p>
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
              Company Details
          ========================== */}

          <div className="profile-section">

            <h2>Company Details</h2>

            <div className="profile-grid">

              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="internshipRole"
                placeholder="Internship Role"
                value={formData.internshipRole}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="companyAddress"
                placeholder="Company Address"
                value={formData.companyAddress}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* =========================
              Manager Details
          ========================== */}

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

          {/* =========================
              Internship Duration
          ========================== */}

          <div className="profile-section">

            <h2>Internship Duration</h2>

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
                required
              />

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="totalWeeks"
                placeholder="Total Weeks"
                min="1"
                value={formData.totalWeeks}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* =========================
              Submit
          ========================== */}

          <div className="profile-buttons">

            <button
              type="submit"
              className="profile-btn"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Internship"}
            </button>

          </div>

        </form>

      </div>
    </StudentLayout>
  );
}