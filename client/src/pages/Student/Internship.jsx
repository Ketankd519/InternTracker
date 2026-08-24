import {useCallback, useEffect, useState,} from "react";
import API from "../../services/api";
import "./StudentStyle.css";

export default function Internship() {
  // Internship Form Data
  const [formData, setFormData] = useState({
    companyName: "",
    internshipRole: "",
    companyAddress: "",
    managerId: "",
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
  const [managers, setManagers] = useState([]);

  // Fetch Student + Internship
  const fetchInternshipData = useCallback(
    async () => {
      try {
        setFetching(true);
        setError("");

        // 0. Fetch All Managers
        let managerList = [];
        try {
          const managerResponse = await API.get("/manager/all");
          const managerList = managerResponse.data.managers || [];
          setManagers(managerList);
        } catch (err) {
          console.error("Failed to fetch managers:", err);
          setManagers([]);
          managerList = [];
        }

        // 1. Fetch Student Profile
        try {
          const studentResponse = await API.get("/students/profile");
          const studentData = studentResponse.data.data;

          // Check whether student profile exists
          if (studentData && studentData.profileCompleted) {
            setProfileCompleted(true);

            // Department comes ONLY from Student collection
            setFormData((prev) => ({
              ...prev,
              department: studentData.department || "",
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
          setProfileCompleted(false);
          setFormData((prev) => ({
            ...prev,
            department: "",
          }));
        }

  // 2. Fetch Existing Internship
  try {
    const internshipResponse = await API.get("/internships/status");
    const internshipData = internshipResponse.data.data?.internship;

  // Internship exists
  if (internshipData) {setInternshipExists(true);

    // Saved Manager ID from Internship collection
    const savedManagerId = internshipData.managerId || "";

    // Find the saved manager from Manager collection
    const savedManager = managerList.find((manager) =>
      manager.managerId === savedManagerId);
    setFormData((prev) => ({
      ...prev,
      companyName: savedManager?.companyName || internshipData.companyName || "",
      internshipRole: internshipData.internshipRole || "",
      companyAddress: internshipData.companyAddress || "",

      // IMPORTANT:
      // Restore saved Manager ID
      managerId: savedManagerId,
      managerName: savedManager?.name || internshipData.managerName || "",
      managerEmail: savedManager?.email || internshipData.managerEmail || "",
      managerPhone: savedManager?.mobileNo || internshipData.managerPhone || "",
      startDate: internshipData.startDate
          ? new Date(
              internshipData.startDate
            )
              .toISOString()
              .split("T")[0]
          : "",
      endDate: internshipData.endDate
          ? new Date(
              internshipData.endDate
            )
              .toISOString()
              .split("T")[0]
          : "",
      totalWeeks: internshipData.totalWeeks || "",

      // Department continues coming from Student.
    }));
  } else {
    setInternshipExists(false);

    // Clear only internship-specific manager data
    setFormData((prev) => ({
      ...prev,
      managerId: "",
      managerName: "",
      managerEmail: "",
      managerPhone: "",
    }));
    }
  } catch {
    setInternshipExists(false);
  }} 
  catch (err) {
    console.error("Fetch Internship Data Error:",err);
      setError(err.response?.data?.message || "Unable to fetch internship data.");
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
    const {name,value,} = e.target;

    // Department is read-only
    // and should never be manually changed.
    if (name === "department") {
      return;
    }
    
    // Manager ID selected
    if (name === "managerId") {
      const selectedManager = managers.find(
        (manager) => manager.managerId === value
      );

      if (selectedManager) {
        setFormData((prev) => ({
          ...prev,
          managerId: selectedManager.managerId,
          companyName: selectedManager.companyName || "",
          managerName: selectedManager.name || "",
          managerEmail: selectedManager.email || "",
          managerPhone: selectedManager.mobileNo || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          managerId: "",
          companyName: "",
          managerName: "",
          managerEmail: "",
          managerPhone: "",
        }));
      }
      return;
    }

    // Start date cannot be before today
    if (name === "startDate") {
      setFormData((prev) => ({
        ...prev,
        startDate: value,
        endDate: "",
      }));
      return;
    }

    // End date must be at least 30 days after start date
    if (name === "endDate" && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(value);
      const minimumEndDate = new Date(start);
      minimumEndDate.setDate(
        minimumEndDate.getDate() + 30
      );

      if (end < minimumEndDate) {
        return;
      }
    }

    if (name === "totalWeeks") {
      // 1. Allow backspace / empty input
      if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // 2. Allow only 1-2 integer digits and numbers from 1 to 53
    const num = parseInt(value, 10);
    if (/^\d{1,2}$/.test(value) && num >= 1 && num <= 53) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    return;
  }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get minimum allowed ending date
  const getMinimumEndDate = () => {
    if (!formData.startDate) {
      return "";
    }

    const start = new Date(
      formData.startDate
    );

    start.setDate(
      start.getDate() + 30
    );

    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, "0");
    const day = String(start.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
        const msg = "Please complete your Student Profile before submitting an internship.";
        setError(msg);
        alert(msg);
        setLoading(false);
        return;
      }

      // Make sure Department exists
    if (!formData.department) {
      const msg = "Department not found. Please complete your Student Profile first.";
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
        managerId: formData.managerId,
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

        const msg = response.data.message || "Internship application submitted successfully.";
        setMessage(msg);
        alert(msg);
        setInternshipExists(true);
      }

      // UPDATE INTERNSHIP
      else {
        response = await API.put("/internships", data);
        const msg = response.data.message || "Internship details updated successfully.";
        setMessage(msg);
        alert(msg);
      }

      // Fetch Latest Data From MongoDB
      await fetchInternshipData();
    } catch (err) {
      console.error("Internship Save/Update Error:",err);
      const msg = err.response?.data?.message || "Unable to save internship details.";
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
            <div className="profile-field">
              <label htmlFor="managerId">Manager ID</label>
              <select name="managerId" value={formData.managerId}
                onChange={handleChange}
                required
                >
                <option value="">Select Manager ID</option>
                {managers.map((manager) => (
                  <option
                  key={manager._id}
                  value={manager.managerId}
                  >
                    {manager.managerId}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-field">
              <label htmlFor="companyaName">Company Name</label>
              <input type="text" name="companyName"
                placeholder="Company Name"
                value={ formData.companyName}
                readOnly
                required
                />
            </div>

            <div className="profile-field">
            <label htmlFor="internshiprole">Internship Role</label>
              <input type="text" name="internshipRole"
                placeholder="Internship Role"
                value={ formData.internshipRole}
                onChange={handleChange}
                required
                />
            </div>    
            </div>
          </div>

              {/* Manager Details */}
          <div className="profile-section">
            <h2>Manager Details</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label htmlFor="managerName">Manager Name</label>
                  <input type="text" name="managerName"
                    placeholder="Manager Name"
                    value={formData.managerName}
                    readOnly
                    required
                  />
              </div>

              <div className="profile-field">
                <label htmlFor="managerEmail">Manager Email</label>
                  <input type="email" name="managerEmail"
                    placeholder="Manager Email"
                    value={ formData.managerEmail}
                    readOnly
                    required
                  />
              </div>

              <div className="profile-field">
              <label htmlFor="managerPhone">Manager Phone Number</label>  
                <input type="text" name="managerPhone"
                  placeholder="Manager Phone"
                  maxLength="10" value={ formData.managerPhone}
                  readOnly
                  required
                />
              </div>  
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
                  <input type="date" id="startDate"
                    name="startDate" value={formData.startDate}
                    min={getTodayDate()} onChange={handleChange}
                    required
                  />
              </div>

              <div className="profile-field">
                <label htmlFor="endDate">Ending Date</label>
                <input type="date" id="endDate"
                  name="endDate" value={formData.endDate}
                  min={getMinimumEndDate()}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="address">Company Address</label>
                  <input type="text" name="companyAddress"
                    placeholder="Company Address"
                    value={ formData.companyAddress}
                    onChange={handleChange}
                    required
                  />
              </div>

              <div className="profile-field">
                <label htmlFor="totalweeks">Total Weeks</label>
                  <input type="number" name="totalWeeks"
                    placeholder="Total Weeks (1-53)"
                    min="1" max="53" value={ formData.totalWeeks}
                    onChange={handleChange} onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();}}}  
                    required
                  />
              </div>
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