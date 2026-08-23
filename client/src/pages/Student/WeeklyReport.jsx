import { useEffect, useState } from "react";
import API from "../../services/api";
import "./StudentStyle.css";

export default function WeeklyReport() {
const today = new Date().toISOString().split("T")[0];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  // Form Data
  const [formData, setFormData] = useState({
    weekNumber: "",
    taskTitle: "",
    description: "",
    attachment: null,
    submissionDate: "",
  });

  // Reports
  const [reports, setReports] = useState([]);
  const [totalWeeks, setTotalWeeks] = useState(null);
  const [loadingReports, setLoadingReports] = useState(true);

  // Form State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit Report State
  const [editingReportId, setEditingReportId] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);

  // Fetch Student Reports
  useEffect(() => {

    //The syntax error show because this function is colling but not using.
    //This is because the new user register function can not fetch the data.
    //If Already register stuent with complete profile the data is fetching and the function is using.
    // so ignore this error.
    fetchReports();
    fetchInternship();
  }, []);

    const fetchInternship = async () => {
      try {
        const response = await API.get("/internships/status");

        const internship = response.data.data?.internship;

        if (internship) {
          setTotalWeeks(internship.totalWeeks);
        }
      } catch (err) {
        console.error("Fetch Internship Error:", err);
      }
    };


  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      setError("");

      const response = await API.get("/reports");

      console.log("Weekly Reports Response:",
        response.data
      );

      const reportData = response.data.data || [];

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
 
  // Edit rejected report
  const handleEdit = (report) => {
    setEditingReportId(report._id);

    setFormData({
      weekNumber: report.weekNumber,
      taskTitle: report.taskTitle || "",
      description: report.description || "",
      attachment: null,
      submissionDate: report.submissionDate
        ? new Date(report.submissionDate)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setMessage("");
    setError("");

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle Input Changes
  const handleChange = (e) => {
  const { name, value, files } = e.target;

  // FILE INPUT
  if (files) {
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));

    return;
  }

  // WEEK NUMBER
  if (name === "weekNumber") {
    // Allow empty value while typing/deleting
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        weekNumber: "",
      }));

      return;
    }

    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return;
    }

    // Maximum 2 digits
    if (value.length > 2) {
      return;
    }

    const weekNumber = Number(value);

    // Must be at least 1
    if (weekNumber < 1) {
      return;
    }

    // Cannot exceed internship total weeks
    if (totalWeeks && weekNumber > totalWeeks) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      weekNumber: value,
    }));

    return;
  }

  // NORMAL INPUT
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

    // Submit / Update Weekly Report
  const handleSubmit = async (e) => {
    e.preventDefault();

    const weekNumber = Number(formData.weekNumber);

    // Validate submission date
    if (!formData.submissionDate) {
      const msg = "Please select a submission date.";

      setError(msg);
      alert(msg);
      return;
    }

    if (formData.submissionDate < today) {
      const msg =
        "Submission date cannot be before today.";

      setError(msg);
      alert(msg);
      return;
    }

    // Validate week number
    if (totalWeeks && weekNumber > totalWeeks) {
      const msg =
        `Invalid week number. Your internship is for ${totalWeeks} weeks. You cannot submit a report for Week ${weekNumber}.`;

      setError(msg);
      alert(msg);
      return;
    }

    if (weekNumber < 1) {
      const msg = "Week number must be at least 1.";

      setError(msg);
      alert(msg);
      return;
    }

    // Count words
    const countWords = (text) => {
      return text.trim()
        ? text.trim().split(/\s+/).length
        : 0;
    };

    const descriptionWordCount =
      countWords(formData.description);

    if (descriptionWordCount > 200) {
      const msg =
        "Description cannot exceed 200 words.";

      setError(msg);
      alert(msg);
      return;
    }

    // Validate attachment size
    if (formData.attachment) {
      if (formData.attachment.size > MAX_FILE_SIZE) {
        const msg =
          "Attachment size cannot exceed 5 MB.";

        setError(msg);
        alert(msg);
        return;
      }
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      // IMPORTANT:
      // Week number is sent only during NEW submission.
      // During edit, backend keeps the original week number.
      if (!editingReportId) {
        data.append(
          "weekNumber",
          formData.weekNumber
        );
      }

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

      let response;

      if (editingReportId) {

        // UPDATE rejected report
        response = await API.put(
          `/reports/${editingReportId}`,
          data
        );

      } else {

        // NEW report
        response = await API.post(
          "/reports",
          data
        );
      }

      console.log(
        "Weekly Report Response:",
        response.data
      );

      const successMessage =
        response.data.message ||
        (
          editingReportId
            ? "Weekly report updated successfully."
            : "Weekly report submitted successfully."
        );

      setMessage(successMessage);
      alert(successMessage);

      // Exit edit mode
      setEditingReportId(null);

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

      // Refresh reports
      await fetchReports();

    } catch (err) {

      console.error(
        "Weekly Report Error:",
        err
      );

      const errorMessage =
        err.response?.data?.message ||
        "Unable to process weekly report. Please try again.";

      setError(errorMessage);
      alert(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  // Format Date
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  // Status Class
  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "report-status approved";
    }

    if (status === "Rejected") {
      return "report-status rejected";
    }

    return "report-status pending";
  };

  // Attachment URL
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

    return `http://localhost:5000/${attachment.replace(/\\/g, "/")}`;
  };

  return (
      <div className="profile-page">

            {/* Header */}
        <div className="profile-header">
          <h1>Weekly Report</h1>
          <p>Submit your internship work completed this week.</p>
        </div>

            {/* Success Message */}
        {message && (
          <div className="success-message">{message}</div>
        )}

            {/* Error Message */}
        {error && (
          <div className="error-message">{error}</div>
        )}

            {/* Submission Form */}
        <form className="profile-form" onSubmit={handleSubmit}>

          {/* Weekly Submission */}
          <div className="profile-section">
            <h2>Weekly Submission</h2>
            <div className="profile-grid">

              {/* Week Number */}
              <div className="profile-field">
                <label htmlFor="weekNumber">
                  Week Number
                  {totalWeeks && ` (1 - ${totalWeeks})`}
                </label>

                <input
                  type="text"
                  id="weekNumber"
                  name="weekNumber"
                  placeholder="Enter week number"
                  inputMode="numeric"
                  pattern="[0-9]{1,2}"
                  maxLength="2"
                  value={formData.weekNumber}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    // Prevent e, E, +, -, ., etc.
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  disabled={editingReportId !== null}
                  required
                />
              </div>

              {/* Submission Date */}
              <div className="profile-field">
                <label htmlFor="submissionDate">
                  Submission Date
                </label>

                <input
                  type="date"
                  id="submissionDate"
                  name="submissionDate"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              {/* Task Title */}
              <div className="profile-field">
                <label htmlFor="taskTitle">Task Title</label>
              <input type="text" name="taskTitle"
                placeholder="Task Title"
                value={formData.taskTitle}
                onChange={handleChange}
                required
              />
              </div>

              {/* Description */}
              <textarea rows="6" name="description"
                placeholder="Describe the work completed this week... (Maximum 200 words)"
                value={formData.description}
                onChange={handleChange}
                required
              />

              {/* Attachment */}
              <div className="file-upload">
                <label> Attachment </label>
                <input type="file" name="attachment"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleChange}
                />
                <small>
                  Maximum file size: 5 MB
                </small>
              </div>
            </div>
          </div>

              {/* Submit Button */}
          <div className="profile-buttons">
          {editingReportId && !loading && (
            <button
              type="button"
              className="profile-btn"
              onClick={() => {
                setEditingReportId(null);

                setFormData({
                  weekNumber: "",
                  taskTitle: "",
                  description: "",
                  attachment: null,
                  submissionDate: "",
                });

                setMessage("");
                setError("");
              }}
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            className="profile-btn"
            disabled={loading}
          >
            {loading
              ? editingReportId
                ? "Updating..."
                : "Submitting..."
              : editingReportId
                ? "Update Report"
                : "Submit Report"}
          </button>
          </div>
        </form>

            {/* Submitted Reports */}
        <div className="dashboard-box">
          <div className="box-title">
            <h3>Submitted Weekly Reports</h3>
            <span> {reports.length} Reports</span>
          </div>

              {/* Loading */}
          {loadingReports ? (
            <p className="progress-text">
              Loading submitted reports...
            </p>
          ) : reports.length === 0 ? (

              //  No Reports
            <p className="progress-text">
              No weekly reports submitted yet.
            </p>

          ) : (

              //  Reports Table
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Submission Date</th>
                    <th>Week</th>
                    <th>Task Title</th>
                    <th>Description</th>
                    <th>Attachment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {

                    const attachmentUrl =
                      getAttachmentUrl(
                        report.attachment
                      );

                    return (
                      <tr key={report._id}>

                        {/* Submission Date */}
                        <td> {formatDate( report.submissionDate )}</td>

                        {/* Week Number */}
                        <td> Week{" "}{report.weekNumber} </td>

                        {/* Task Title */}
                        <td> {report.taskTitle}</td>

                        {/* Description */}
                        <td>
                          <div className="report-description">
                            {report.description}
                          </div>
                        </td>

                        {/* Attachment */}
                        <td>
                          {attachmentUrl ? (
                            <a href={ attachmentUrl }
                              target="_blank" rel="noopener noreferrer"
                            >
                              View File
                            </a>

                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={getStatusClass(report.status)}>
                            {report.status || "Pending"}
                          </span>

                          {report.status === "Rejected" &&
                            (report.remark || report.rejectionRemark) && (
                              <div className="rejection-remark">
                                <strong>Remark:</strong>{" "}
                                {report.remark || report.rejectionRemark}
                              </div>
                            )}

                          {report.status === "Rejected" && (
                            <button
                              type="button"
                              className="report-edit-btn"
                              onClick={() => handleEdit(report)}
                              disabled={editingReportId !== null}
                            >
                              Edit
                            </button>
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
  );
}