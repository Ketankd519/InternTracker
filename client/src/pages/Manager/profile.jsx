import { useEffect, useState } from "react";
import API from "../../services/api";
import "./ManagerStyle.css";

export default function ManagerProfile() {

    // FORM DATA
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    managerId: "",
    mobileNo: "",
    experience: "",
    companyName: "",
    signature: "",
  });

  // PROFILE STATE
  const [profileSaved, setProfileSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // FETCH MANAGER PROFILE
  useEffect(() => {
    fetchManagerProfile();
  }, []);

  const fetchManagerProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await API.get("/manager/profile");
      const data = response.data;

      // USER COLLECTION DATA
      const user = data.user || {};

      // MANAGER COLLECTION DATA
      const manager = data.manager || {};

      // SET FORM DATA
      setFormData({
        name: user.name || "",
        email: user.email || "",
        managerId: manager.managerId || "",
        mobileNo: manager.mobileNo || "",
        experience:manager.experience !== undefined && manager.experience !== null
            ? manager.experience : "",
        companyName: manager.companyName || "",
        signature: manager.signature || "",
      });

      // CHECK PROFILE EXISTS
      if (data.profileExists && manager.managerId
      ) {
        setProfileSaved(true);
      } else {
        setProfileSaved(false);
      }

    } catch (err) {
      console.error("Manager Profile Fetch Error:", err);
      console.error( "Backend Response:", err.response?.data);
      setError(err.response?.data?.message || "Unable to load manager profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
  const { name, value, files } = e.target;

  // MOBILE NUMBER VALIDATION
  if (name === "mobileNo") {
    // Allow only numbers and maximum 10 digits
    const onlyNumbers = value
      .replace(/\D/g, "")
      .slice(0, 10);

    setFormData((previous) => ({
      ...previous,
      mobileNo: onlyNumbers,
    }));

    setMessage("");
    setError("");
    return;
  }

  setFormData((previous) => ({
    ...previous,
    [name]: files ? files[0] : value,
  }));

  setMessage("");
  setError("");
};

  // VALIDATION
  const validateForm = () => {

    // COMPANY NAME
    if (!formData.companyName.trim()) {
      setError("Company Name is required.");
      return false;
    }

  // MOBILE NUMBER
  const mobileNumber = formData.mobileNo.trim();

  if (!mobileNumber) {
    setError("Mobile number is required.");
    return false;
  }

  const mobileRegex = /^[0-9]{10}$/;

  if (!mobileRegex.test(mobileNumber)) {
    setError("Mobile number must contain exactly 10 digits.");
    return false;
  }

    // EXPERIENCE
    if (formData.experience !== "") {
      const experienceNumber = Number(formData.experience);
      if (Number.isNaN(experienceNumber) || experienceNumber < 0
      ) {
        setError("Experience must be a valid number.");
        return false;
      }
    }
    return true;
  };

  // SAVE / UPDATE PROFILE
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      // VALIDATION
      if (!validateForm()) {
        setSaving(false);
        return;
      }

      // REQUEST DATA
  const requestData = new FormData();

  requestData.append("mobileNo",formData.mobileNo.trim());
  requestData.append("experience",formData.experience === "" ? ""
    : String(formData.experience).trim());
  requestData.append("companyName",formData.companyName.trim());
  if (formData.signature instanceof File) {
    requestData.append(
      "signature",
      formData.signature
    );
  }
      let response;

      // FIRST SAVE
      // POST /api/manager/profile
      if (!profileSaved) {
        response = await API.post("/manager/profile", requestData);
      }

      // UPDATE
      // PUT /api/manager/profile
      else {
        response = await API.put("/manager/profile", requestData);
      }
      const data = response.data;

      // MANAGER DATA RETURNED FROM BACKEND
      const manager = data.manager || {};

      // USER DATA
      const user = data.user || {};

      // UPDATE FORM WITH SERVER DATA
      setFormData((previous) => ({
        ...previous,

        name:user.name || previous.name,
        email: user.email || previous.email,
        managerId: manager.managerId || previous.managerId,
        mobileNo: manager.mobileNo !== undefined && manager.mobileNo !== null
            ? manager.mobileNo : "",
        experience: manager.experience !== undefined && manager.experience !== null
            ? manager.experience : "",
        companyName: manager.companyName || previous.companyName,
        signature: manager.signature || previous.signature,
      }));

      // PROFILE NOW EXISTS
      setProfileSaved(true);

      alert(data.message || (
            profileSaved
              ? "Manager profile updated successfully."
              : "Manager profile saved successfully."
          ));

      // SUCCESS MESSAGE
      setMessage(
        data.message || (
            profileSaved
              ? "Manager profile updated successfully."
              : "Manager profile saved successfully."
          ));
      } catch (err) {
        console.error("Manager Profile Save Error:", err);
        console.error("Backend Response:", err.response?.data);
      alert(err.response?.data?.message || "Unable to save manager profile.")
      setError(err.response?.data?.message || "Unable to save manager profile.");
    } finally {
      setSaving(false);
    }
  };

    function getSignatureUrl(signature) {
    if (!signature) {
      return null;
    }

    if (
      signature.startsWith("http://") ||
      signature.startsWith("https://")
    ) {
      return signature;
    }

  const cleanPath = signature
    .replace(/\\/g, "/")
    .replace(/^uploads\//, "");

  return `http://localhost:5000/uploads/${cleanPath}`;
}

  // LOADING
  if (loading) {
    return (
      <div className="manager-profile-page">
        <div className="profile-page-header">
          <h1>Manager Profile</h1>
          <p>Manage your manager profile information.</p>
        </div>
        <div className="manager-profile-container">
          <p>Loading manager profile...</p>
        </div>
      </div>
    );
  }

  // PAGE
  return (
    <div className="manager-profile-page">

          {/* PAGE HEADER */}
      <div className="profile-page-header">
        <h1>Manager Profile</h1>
        <p>Manage your manager profile information.</p>
      </div>

          {/* MAIN PROFILE CONTAINER */}
      <div className="manager-profile-container">

            {/* BASIC INFORMATION */}
        <div className="manager-profile-section">
          <h2>Basic Information</h2>
          <div className="manager-profile-form-grid">

                {/* MANAGER NAME */}
            <div className="manager-profile-form-group">
              <label>Manager Name</label>
              <input type="text" value={formData.name} readOnly/>
            </div>

                {/* MANAGER EMAIL */}
            <div className="manager-profile-form-group">
              <label>Manager Email</label>
              <input type="email" value={formData.email} readOnly/>
            </div>

                {/* MANAGER ID */}
            <div className="manager-profile-form-group">
              <label>Manager ID</label>
              <input type="text" className="manager-profile-id"
                value={formData.managerId || "Generated after saving"}
                readOnly
              />
            </div>

                {/* MOBILE NUMBER */}
            <div className="manager-profile-form-group">
              <label>Mobile Number
                <span style={{fontWeight: "400", color: "#94a3b8", marginLeft: "5px",}}></span>
              </label>

              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange}
                placeholder="Enter 10 digit mobile number" maxLength={10} inputMode="numeric"
                pattern="[0-9]{10}" disabled={saving}
                required
              />
            </div>

                {/* MANAGER SIGNATURE */}
            <div className="manager-signature-upload">
              <label htmlFor="signature">Manager Signature</label>
              <div className="manager-signature-preview">
                {formData.signature ? (
                  <img src={formData.signature instanceof File
                          ? URL.createObjectURL(
                            formData.signature
                          )
                        : getSignatureUrl(
                            formData.signature
                          )
                      }
                    alt="Manager Signature"
                  />
                ) : (
                  <span>No signature uploaded</span>
                )}
              </div>
              <input type="file" id="signature" name="signature"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleChange} disabled={saving}
                required
              />

        <small>Recommended format: PNG (transparent background).</small>
          <div className="teacher-signature-instructions-IMP">
            <strong>Signature Guidelines:</strong>
            ✍️ Use a 0.7–1.0 mm black/dark-blue pen, 
            remove the <br/>background, and upload a clear transparent PNG. 
            This signature will be displayed<br/> on the certificate.
          </div>
        </div>
          <div className="teacher-signature-instructions">
          <strong>Signature Guidelines:</strong>
          <div className="signature-sample-image">
              <img src="/images/signature-guidelines2.png"
                alt="Accepted and Not Accepted signature examples"
              />
          </div>
      </div>
    </div>
  </div>

            {/* COMPANY INFORMATION */}
        <div className="manager-profile-section">
          <h2>Company Information</h2>
          <div className="manager-profile-form-grid">

                {/* COMPANY NAME */}
            <div className="manager-profile-form-group full-width">
              <label>Company Name</label>
              <input type="text" name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                disabled={saving}
                required
              />
            </div>
            <div className="manager-profile-form-group full-width">
              <label>Experience
                <span style={{fontWeight: "400", color: "#94a3b8", marginLeft: "5px",}}>
                  (Optional)
                </span>
              </label>
              <input type="number" name="experience" value={formData.experience}
                onChange={handleChange} placeholder="Experience in years"
                min="0" step="0.1" disabled={saving}
              />
            </div>
          </div>
        </div>

            {/* SUCCESS MESSAGE */}
        {message && (
          <div className="manager-profile-message"
            style={{color: "#166534", background: "#dcfce7", border: "1px solid #86efac",}}>
            {message}
          </div>
        )}

            {/* ERROR MESSAGE */}
        {error && (
          <div className="manager-profile-message"
            style={{color: "#991b1b",background: "#fee2e2", border: "1px solid #fca5a5",}}>
            {error}
          </div>
        )}

            {/* SAVE / UPDATE BUTTON */}
        <div className="manager-profile-actions">
          <button type="button" className="manager-profile-save-btn"
            onClick={handleSubmit} disabled={saving}
          >
            {saving
              ? "Saving..."
              : profileSaved
              ? "Update Profile"
              : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}