import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import API from "../../services/api";
import "./StudentStyle.css";

export default function WeeklyReport() {
  // ==========================================
  // Form Data
  // ==========================================

  const [formData, setFormData] = useState({
    weekNumber: "",
    taskTitle: "",
    description: "",
    attachment: null,
    submissionDate: "",
  });

  // ==========================================
  // Reports
  // ==========================================

  const [reports, setReports] = useState([]);

  const [loadingReports, setLoadingReports] =
    useState(true);

  // ==========================================
  // Form State
  // ==========================================

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ==========================================
  // Fetch Student Reports
  // ==========================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      setError("");

      const response = await API.get("/reports");

      console.log(
        "Weekly Reports Response:",
        response.data
      );

      const reportData =
        response.data.data || [];

      setReports(reportData);
    } catch (err) {
      console.error(
        "Fetch Weekly Reports Error:",
        err
      );

      setReports([]);

      setError(
        err.response?.data?.message ||
          "Unable to fetch weekly reports."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  // ==========================================
  // Handle Input Changes
  // ==========================================

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

  // ==========================================
  // Submit Weekly Report
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // ========================================
      // FormData
      // ========================================

      const data = new FormData();

      data.append(
        "weekNumber",
        formData.weekNumber
      );

      data.append(
        "taskTitle",
        formData.taskTitle
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "submissionDate",
        formData.submissionDate
      );

      if (formData.attachment) {
        data.append(
          "attachment",
          formData.attachment
        );
      }

      // ========================================
      // Submit Report
      // ========================================

      const response = await API.post(
        "/reports",
        data
      );

      console.log(
        "Weekly Report Submit Response:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Weekly report submitted successfully."
      );

      // ========================================
      // Reset Form
      // ========================================

      setFormData({
        weekNumber: "",
        taskTitle: "",
        description: "",
        attachment: null,
        submissionDate: "",
      });

      // Reset file input
      e.target.reset();

      // ========================================
      // Refresh Reports Table
      // ========================================

      await fetchReports();
    } catch (err) {
      console.error(
        "Weekly Report Error:",
        err
      );

      const errorMessage =
        err.response?.data?.message ||
        "Unable to submit weekly report. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  // ==========================================
  // Status Class
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "report-status approved";
    }

    if (status === "Rejected") {
      return "report-status rejected";
    }

    return "report-status pending";
  };

  // ==========================================
  // Attachment URL
  // ==========================================

  const getAttachmentUrl = (attachment) => {
    if (!attachment) {
      return null;
    }

    // If backend already returns complete URL
    if (
      attachment.startsWith("http://") ||
      attachment.startsWith("https://")
    ) {
      return attachment;
    }

    // Your backend serves uploads using:
    // app.use("/uploads", express.static("uploads"));

    return `http://localhost:5000/${attachment.replace(
      /\\/g,
      "/"
    )}`;
  };

  return (
    <StudentLayout>
      <div className="profile-page">

        {/* =====================================
            Header
        ====================================== */}

        <div className="profile-header">
          <h1>Weekly Report</h1>

          <p>
            Submit your internship work completed
            this week.
          </p>
        </div>

        {/* =====================================
            Success Message
        ====================================== */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {/* =====================================
            Error Message
        ====================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =====================================
            Submission Form
        ====================================== */}

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          {/* Weekly Submission */}

          <div className="profile-section">

            <h2>
              Weekly Submission
            </h2>

            <div className="profile-grid">

              {/* Week Number */}

              <input
                type="number"
                name="weekNumber"
                placeholder="Week Number"
                min="1"
                value={formData.weekNumber}
                onChange={handleChange}
                required
              />

              {/* Submission Date */}

              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
                required
              />

              {/* Task Title */}

              <input
                type="text"
                name="taskTitle"
                placeholder="Task Title"
                value={formData.taskTitle}
                onChange={handleChange}
                required
              />

              {/* Description */}

              <textarea
                rows="6"
                name="description"
                placeholder="Describe the work completed this week..."
                value={formData.description}
                onChange={handleChange}
                required
              />

              {/* Attachment */}

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

          {/* =====================================
              Submit Button
          ====================================== */}

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

        {/* =====================================
            Submitted Reports
        ====================================== */}

        <div className="dashboard-box">

          <div className="box-title">

            <h3>
              Submitted Weekly Reports
            </h3>

            <span>
              {reports.length} Reports
            </span>

          </div>

          {/* ===================================
              Loading
          ==================================== */}

          {loadingReports ? (
            <p className="progress-text">
              Loading submitted reports...
            </p>
          ) : reports.length === 0 ? (

            /* =================================
               No Reports
            ================================== */

            <p className="progress-text">
              No weekly reports submitted yet.
            </p>

          ) : (

            /* =================================
               Reports Table
            ================================== */

            <div className="table-container">

              <table className="reports-table">

                <thead>

                  <tr>

                    <th>
                      Submission Date
                    </th>

                    <th>
                      Week
                    </th>

                    <th>
                      Task Title
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Attachment
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {reports.map((report) => {

                    const attachmentUrl =
                      getAttachmentUrl(
                        report.attachment
                      );

                    return (
                      <tr
                        key={report._id}
                      >

                        {/* Submission Date */}

                        <td>
                          {formatDate(
                            report.submissionDate
                          )}
                        </td>

                        {/* Week Number */}

                        <td>
                          Week{" "}
                          {report.weekNumber}
                        </td>

                        {/* Task Title */}

                        <td>
                          {report.taskTitle}
                        </td>

                        {/* Description */}

                        <td>
                          <div className="report-description">
                            {report.description}
                          </div>
                        </td>

                        {/* Attachment */}

                        <td>

                          {attachmentUrl ? (

                            <a
                              href={
                                attachmentUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View File
                            </a>

                          ) : (
                            "-"
                          )}

                        </td>

                        {/* Status */}

                        <td>

                          <span
                            className={getStatusClass(
                              report.status
                            )}
                          >
                            {report.status ||
                              "Pending"}
                          </span>

                          {/* Rejection Remark */}

                          {report.status ===
                            "Rejected" &&
                            (report.remark ||
                              report.rejectionRemark) && (

                              <div className="rejection-remark">

                                <strong>
                                  Remark:
                                </strong>{" "}

                                {report.remark ||
                                  report.rejectionRemark}

                              </div>

                            )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </StudentLayout>
  );
}