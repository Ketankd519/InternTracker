import {useCallback, useEffect, useState,} from "react";
import API from "../../services/api";
import "./StudentStyle.css";

export default function Internship() {

  // Internship Form Data
  const [formData, setFormData] = useState({
    companyName: "",
    internshipRole: "",
    companyAddress: "",
    managerName: "",
    managerEmail: "",
    managerPhone: "",

    // Comes automatically from Student collection
    department: "",
    startDate: "",
    endDate: "",
    totalWeeks: "",
  });

  // Profile / Internship State
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [internshipExists, setInternshipExists] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch Student + Internship
  const fetchInternshipData = useCallback(
    async () => {
      try {
        setFetching(true);
        setError("");

        // 1. Fetch Student Profile
        try {
          const studentResponse =
            await API.get("/students/profile");

          console.log(
            "Student Profile Response:",
            studentResponse.data
          );

          const studentData =
            studentResponse.data.data;

          // Check whether student profile exists
          if (
            studentData &&
            studentData.profileCompleted
          ) {
            setProfileCompleted(true);

            // Department comes ONLY from Student collection
            setFormData((prev) => ({
              ...prev,
              department:
                studentData.department || "",
            }));
          } else {
            setProfileCompleted(false);

            // If profile is not completed,
            // department remains empty.
            setFormData((prev) => ({
              ...prev,
              department: "",
            }));
          }
        } catch {
          console.log(
            "Student profile not found."
          );

          setProfileCompleted(false);

          setFormData((prev) => ({
            ...prev,
            department: "",
          }));
        }

        // 2. Fetch Existing Internship
        try {
          const internshipResponse =
            await API.get("/internships/status");

          console.log(
            "Internship Response:",
            internshipResponse.data
          );

          const internshipData =
            internshipResponse.data.data?.internship;

          // Internship exists
          if (internshipData) {
            setInternshipExists(true);

            setFormData((prev) => ({
              ...prev,

              companyName: internshipData.companyName || "",
              internshipRole: internshipData.internshipRole || "",
              companyAddress: internshipData.companyAddress || "",
              managerName: internshipData.managerName || "",
              managerEmail: internshipData.managerEmail || "",
              managerPhone: internshipData.managerPhone || "",

              startDate:
                internshipData.startDate
                  ? new Date(
                      internshipData.startDate
                    )
                      .toISOString()
                      .split("T")[0]
                  : "",

              endDate:
                internshipData.endDate
                  ? new Date(
                      internshipData.endDate
                    )
                      .toISOString()
                      .split("T")[0]
                  : "",

              totalWeeks:
                internshipData.totalWeeks || "",

              // Department is NOT taken from Internship.
              // It continues coming from Student.
            }));
          } else {
            setInternshipExists(false);
          }
        } catch {
          // New user may not have internship yet.
          setInternshipExists(false);

          console.log("No internship found.");
        }
      } catch (err) {
        console.error(
          "Fetch Internship Data Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to fetch internship data."
        );
      } finally {
        setFetching(false);
      }
    },
    []
  );

  // Fetch Data When Page Opens
  useEffect(() => {

    //The syntax error show because this function is colling but not using.
    //This is because the new user register function can not fetch the data.
    //If Already register stuent with complete profile the data is fetching and the function is using.
    // so ignore this error.
    fetchInternshipData();
  }, [fetchInternshipData]);

  // Handle Input Changes
  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    // Department is read-only
    // and should never be manually changed.
    if (name === "department") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit / Update Internship
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {

      // Make sure Student Profile is completed
      if (!profileCompleted) {
        const msg =
          "Please complete your Student Profile before submitting an internship.";

        setError(msg);
        alert(msg);

        setLoading(false);
        return;
      }

      // Make sure Department exists
    if (!formData.department) {
      const msg =
        "Department not found. Please complete your Student Profile first.";

      setError(msg);
      alert(msg);

      setLoading(false);
      return;
    }

      // Data sent to Internship backend
      const data = {
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        internshipRole: formData.internshipRole,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        managerPhone: formData.managerPhone,

        // Department comes from Student collection
        department: formData.department,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalWeeks: Number(formData.totalWeeks),
      };

      let response;

      // CREATE INTERNSHIP
      if (!internshipExists) {
        response = await API.post("/internships", data);

        const msg =
          response.data.message ||
          "Internship application submitted successfully.";

        setMessage(msg);
        alert(msg);

        setInternshipExists(true);
      }

      // UPDATE INTERNSHIP
      else {
        response = await API.put("/internships", data);

        const msg =
          response.data.message ||
          "Internship details updated successfully.";

        setMessage(msg);
        alert(msg);
      }

      console.log("Internship Save/Update Response:",
        response.data
      );

      // Fetch Latest Data From MongoDB
      await fetchInternshipData();
    } catch (err) {
      console.error("Internship Save/Update Error:",
        err
      );

      const msg =
        err.response?.data?.message ||
        "Unable to save internship details.";

      setError(msg);
      alert(msg);

    } finally {
      setLoading(false);
    }
  };

  // Loading Screen
  if (fetching) {
    return (
        <div className="profile-page">
          <div className="profile-header">
            <h1>Internship</h1>
            <p>Loading internship details...</p>
          </div>
        </div>
    );
  }

  // Internship Page
  return (
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

            {/* Profile Warning */}
        {!profileCompleted && (
          <div className="error-message">
            Please complete your Student Profile
            first. Department will automatically
            appear here after your profile is
            completed.
          </div>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>

              {/* Company Details */}
          <div className="profile-section">
            <h2>Company Details</h2>
            <div className="profile-grid">
              <input type="text" name="companyName"
                placeholder="Company Name"
                value={ formData.companyName}
                onChange={handleChange}
                required
              />

              <input type="text" name="internshipRole"
                placeholder="Internship Role"
                value={ formData.internshipRole}
                onChange={handleChange}
                required
              />

              <input type="text" name="companyAddress"
                placeholder="Company Address"
                value={ formData.companyAddress}
                onChange={handleChange}
                required
              />
            </div>
          </div>

              {/* Manager Details */}
          <div className="profile-section">
            <h2>Manager Details</h2>

            <div className="profile-grid">
              <input type="text" name="managerName"
                placeholder="Manager Name"
                value={formData.managerName}
                onChange={handleChange}
                required
              />

              <input type="email" name="managerEmail"
                placeholder="Manager Email"
                value={ formData.managerEmail}
                onChange={handleChange}
                required
              />

              <input type="text" name="managerPhone"
                placeholder="Manager Phone"
                value={ formData.managerPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

              {/* Internship Duration */}
          <div className="profile-section">
            <h2>Internship Duration</h2>
            <div className="profile-grid">

                  {/* Department
                  Comes from Student collection */}
            <div className="profile-field">
              <label htmlFor="department">Department</label>
              <input type="text" name="department"
                value={formData.department}
                placeholder="Department"
                readOnly
              />
              </div>

              <div className="profile-field">
                <label htmlFor="startDate">Starting Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="endDate">Ending Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <input type="number" name="totalWeeks"
                placeholder="Total Weeks"
                min="1"
                value={ formData.totalWeeks}
                onChange={handleChange}
                required
              />

            </div>
          </div>

              {/* Buttons */}
          <div className="profile-buttons">

                {/* Submit Internship */}
            {!internshipExists && (
              <button type="submit" className="profile-btn"
                disabled={ loading || !profileCompleted }
              >
                {loading
                  ? "Submitting..."
                  : "Submit Internship"}
              </button>
            )}

                {/* Update Internship */}
            {internshipExists && (
              <button type="submit" className="profile-btn"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Update Internship"}
              </button>
            )}
          </div>
        </form>
      </div>
  );
}