import { useEffect, useState } from "react";
import API from "../../services/api";
import "./StudentStyle.css";

const emptyForm = {
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
  rollNo: "",
  enrollmentNumber: "",
  teacherId: "",
  teacherName: "",
  teacherNo: "",
  cgpa: "",
  profilePhoto: "",
};

const getProfilePhotoUrl = (photo) => {
  if (!photo) return "";

  // If browser already has a complete URL
  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://")
  ) {
    return photo;
  }

  // Clean Windows-style paths
  const cleanPath = photo
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")

      // Remove possible prefixes
    .replace(/^server\/uploads\//, "")
    .replace(/^uploads\//, "");

      // If database contains profile/filename.jpg
    if (cleanPath.startsWith("profile/")) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }

  return `http://localhost:5000/uploads/profile/${cleanPath}`;
};

const StudentProfile = () => {
  const [formData, setFormData] = useState(emptyForm);

  // Comes ONLY from users collection
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });

  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Fetch Profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFetching(true);
        setError("");

        const response = await API.get("/students/profile");
        const result = response.data;
        console.log("Student Profile:",result);
        const user = result.data?.user;

        // USER DATA
        // From users collection
        setUserData({
          name: user?.name || "",
          email: user?.email || "",
        });

        // NEW USER
        if (!result.profileExists) {
          setProfileExists(false);
          setFormData(emptyForm);
          return;
        }

        // EXISTING PROFILE
        const data = result.data;
        setProfileExists(true);
        setFormData({
          phone: data.phone || "",
          dob: data.dob
            ? new Date(data.dob)
                .toISOString()
                .split("T")[0]
            : "",

          gender: data.gender || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          college: data.college || "",
          department: data.department || "",
          semester: data.semester ?? "",
          rollNo: data.rollNo || "",
          enrollmentNumber: data.enrollmentNumber || "",
          teacherId: data.teacherId || "",
          teacherName: data.teacherName || "",
          teacherNo: data.teacherNo || "",
          cgpa: data.cgpa ?? "",
          profilePhoto: data.profilePhoto || "",
        });

        // Fetch teachers for saved department
        // so Teacher ID dropdown is populated after page reload
        if (data.department) {
          fetchTeachersByDepartment(data.department);
        }
      } catch (err) {
        console.error("Fetch Student Profile Error:", err );

        setError(
          err.response?.data?.message ||
            "Unable to fetch student profile."
        );
      } finally {
        setFetching(false);
      }
    };
    loadProfile();
  }, []);

  // FETCH TEACHERS BY DEPARTMENT
  const fetchTeachersByDepartment = async (department) => {
    try {
      setLoadingTeachers(true);
      setTeachers([]);

      if (!department) {
        return;
      }

      const response = await API.get(
        `/teacher/list?department=${encodeURIComponent(department)}`
      );

      setTeachers(response.data?.teachers || []);
    } catch (err) {
      console.error("Fetch Teachers Error:", err);

      setTeachers([]);
      setError(
        err.response?.data?.message ||
          "Unable to fetch teachers."
      );
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
  const { name, value, files } = e.target;

  // FILE INPUT
  if (files && files[0]) {
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));

    return;
  }

  // =====================================================
  // PHONE NUMBER
  // Only numbers and maximum 10 digits
  // =====================================================

  if (name === "phone") {
    const phoneValue = value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phone: phoneValue,
    }));

    return;
  }

  // =====================================================
  // SEMESTER
  // Only one digit and only 1-8
  // =====================================================

  if (name === "semester") {
    // Allow empty value while editing
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        semester: "",
      }));

      return;
    }

    // Only allow 1 to 8
    if (/^[1-8]$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        semester: value,
      }));
    }

    return;
  }

  // =====================================================
  // CGPA
  // =====================================================

  if (name === "cgpa") {
    // Allow empty string to let user backspace/clear field
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        cgpa: "",
      }));

      return;
    }

    // Allow 0-9 with up to 2 decimal places
    // or 10 / 10.0 / 10.00
    const cgpaRegex =
      /^([0-9](\.[0-9]{0,2})?|10(\.0{0,2})?)$/;

    if (cgpaRegex.test(value)) {
      setFormData((prev) => ({
        ...prev,
        cgpa: value,
      }));
    }

    return;
  }

  // =====================================================
  // DEPARTMENT CHANGED
  // =====================================================

  if (name === "department") {
    setFormData((prev) => ({
      ...prev,
      department: value,
      teacherId: "",
      teacherName: "",
      teacherNo: "",
      college: "",
    }));

    fetchTeachersByDepartment(value);

    return;
  }

  // =====================================================
  // TEACHER SELECTED
  // =====================================================

  if (name === "teacherId") {
    const selectedTeacher = teachers.find(
      (teacher) => teacher.teacherId === value
    );

    setFormData((prev) => ({
      ...prev,
      teacherId: value,
      teacherName: selectedTeacher?.name || "",
      teacherNo: selectedTeacher?.mobileNo || "",
      college: selectedTeacher?.collegeName || "",
    }));

    return;
  }

  // =====================================================
  // NORMAL INPUT
  // =====================================================

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  // Create / Update
  const handleSubmit = async (e) => {
  e.preventDefault();

  // =====================================================
  // HTML REQUIRED FIELD VALIDATION
  // =====================================================

  if (!e.currentTarget.checkValidity()) {
    alert("Please fill all required fields.");
    return;
  }

  // =====================================================
  // PHONE NUMBER VALIDATION
  // =====================================================

  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(formData.phone)) {
    setError("Phone number must contain exactly 10 digits.");
    alert("Phone number must contain exactly 10 digits.");
    return;
  }

  // =====================================================
  // SEMESTER VALIDATION
  // =====================================================

  if (!/^[1-8]$/.test(String(formData.semester))) {
    setError("Semester must be a number between 1 and 8.");
    alert("Semester must be a number between 1 and 8.");
    return;
  }

  setLoading(true);
  setMessage("");
  setError("");

  try {
      const data = new FormData();

      // Student Details
      data.append("phone",formData.phone);

      if (formData.dob) {data.append("dob",formData.dob);}
      if (formData.gender) {data.append("gender",formData.gender);}

      data.append("address",formData.address);
      data.append("city",formData.city);
      data.append("state",formData.state);
      data.append("pincode",formData.pincode);

      // Academic Details
      data.append("college",formData.college);
      data.append("department",formData.department);
      data.append("semester",formData.semester);
      data.append("rollNo",formData.rollNo);
      data.append("enrollmentNumber",formData.enrollmentNumber);

      if (formData.teacherId.trim() !== "") 
        {data.append("teacherId",
          formData.teacherId.trim()
        );
      }

      if (formData.teacherName.trim() !== "") {
        data.append("teacherName", formData.teacherName.trim());
      }

      data.append("teacherNo",formData.teacherNo);

      if (formData.cgpa !== "") {
        data.append("cgpa",
          formData.cgpa
        );
      }

      // Profile Photo
      if (
        formData.profilePhoto instanceof
        File
      ) {
        data.append("profilePhoto",
          formData.profilePhoto
        );
      }

      let response;

      // CREATE
      if (!profileExists) {
        response = await API.post("/students/profile",data);
      }

      // UPDATE
      else {
        response = await API.put("/students/profile",data);
      }

      console.log("Student Profile Response:",response.data);

      const successMessage =
        response.data?.message ||
        (!profileExists
          ? "Profile saved successfully."
          : "Profile updated successfully.");

      setMessage(successMessage);
      alert(successMessage);

      setMessage(
        profileExists
          ? "Profile updated successfully."
          : "Profile saved successfully."
      );

      // Refresh from MongoDB
      const refreshed = await API.get("/students/profile");
      const result = refreshed.data;
      setProfileExists(result.profileExists);
      const user =result.data?.user;

      setUserData({
        name: user?.name || "",
        email: user?.email || "",
      });

      if (result.profileExists) {
        const profile =result.data;

        setFormData({
          phone:profile.phone || "",
          dob: profile.dob
            ? new Date(profile.dob)
                .toISOString()
                .split("T")[0]
            : "",
          gender: profile.gender || "",
          address:profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          college: profile.college || "",
          department: profile.department || "",
          semester: profile.semester ?? "",
          rollNo: profile.rollNo || "",
          enrollmentNumber:profile.enrollmentNumber || "",
          teacherId: profile.teacherId || "",
          teacherName: profile.teacherName || "",
          teacherNo: profile.teacherNo || "",
          cgpa: profile.cgpa ?? "",
          profilePhoto: profile.profilePhoto || "",
        });
      }
    } catch (err) {
      console.error("Student Profile Error:",err);

      const errorMessage =
        err.response?.data?.message ||
        "Unable to save student profile.";

      setError(errorMessage);
      alert(errorMessage);

      setError(
        err.response?.data?.message ||
          "Unable to save student profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (fetching) {
    return (
        <div className="profile-page">
          <div className="profile-header">
            <h1>Student Profile</h1>
            <p>Loading your profile...</p>
          </div>
        </div>
    );
  }

  // UI
  return (
      <div className="profile-page">
        <div className="profile-header">
          <h1>Student Profile</h1>
          <p>Complete your personal and academic information.</p></div>
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form
          className="profile-form" onSubmit={handleSubmit}>

              {/* Personal Details */}
          <div className="profile-section">
            <h2>Personal Details</h2>
            <div className="profile-grid">
              
            <div className="profile-field">
              <label htmlFor="name">Full Name</label>
              <input type="text" name="fullName"
                value={userData.name}
                placeholder="Full Name"
                readOnly
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" 
                value={userData.email}
                placeholder="Email"
                readOnly
              />
            </div>

              {/* STUDENTS collection */}
            <div className="profile-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                maxLength="10"
                inputMode="numeric"
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

              <div className="profile-field">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="gender">Gender</label>
                  <select name="gender"value={formData.gender}onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
              </div>

              <div className="profile-field">
                <label htmlFor="address">Address</label>
                  <input type="text" name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
              </div>
              
              <div className="profile-field">
                <label htmlFor="state">State</label>                
              <select name="state" value={formData.state}onChange={handleChange}required>
                <option value="">Select a State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Other">Other</option>
              </select>
              </div>

              <div className="profile-field">
                <label htmlFor="pincode">Pincode</label>
              <input type="text" name="pincode"
                placeholder="Pincode"
                maxLength="6"
                value={formData.pincode}
                onChange={handleChange}
                required
                />
              </div>
            <br/>
              <label htmlFor="address">Address</label>
              <textarea rows="4" name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                />


              <div className="photo-upload">
              <label htmlFor="profilePhoto">Profile Photo</label>

              <div className="photo-preview">
                {formData.profilePhoto ? (
                  <img
                    src={
                      formData.profilePhoto instanceof File
                        ? URL.createObjectURL(formData.profilePhoto)
                        : getProfilePhotoUrl(formData.profilePhoto)
                      }
                      alt="Student Profile Preview"
                      onLoad={(e) => {
                        console.log(
                          "Profile image loaded successfully:",
                          e.currentTarget.src
                        );
                      }}
                      onError={(e) => {
                        console.error(
                          "PROFILE IMAGE FAILED:",
                          e.currentTarget.src
                        );
                      }}
                      />
                    ) : (
                      <span>No photo selected</span>
                    )}
              </div>

              <input type="file"
                id="profilePhoto"
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


            <div className="profile-field">
              <label htmlFor="department">Department</label>
              <select name="department" value={formData.department}onChange={handleChange}required>
                <option value="">Select Department</option>
                <option value="CA-Computer Application">CA - Computer Application</option>
                <option value="CS-Computer Science">CS - Computer Science</option>
                <option value="IT-Information Technology">IT - Information Technology</option>
                <option value="AI-Artificial Intelligence">AI - Artificial Intelligence</option>
                <option value="DS-Data Science">DS - Data Science</option>
                <option value="SE-Software Engineering">SE - Software Engineering</option>
                <option value="EL-Electronics">EL - Electronics</option>
                <option value="ET-Electronics and Telecommunication">ET - Electronics and Telecommunication</option>
                <option value="ME-Mechanical Engineering">ME - Mechanical Engineering</option>
                <option value="CE-Civil Engineering">CE - Civil Engineering</option>
                <option value="EE-Electrical Engineering">EE - Electrical Engineering</option>
                <option value="MN-Management">MN - Management</option>
                <option value="CM-Commerce">CM - Commerce</option>
                <option value="SC-Science">SC - Science</option>
                <option value="AR-Arts">AR - Arts</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="teacherId">Teacher ID</label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                required
                disabled={!formData.department || loadingTeachers}
                >
                <option value="">
                  {loadingTeachers
                    ? "Loading Teachers..."
                    : !formData.department
                    ? "Select Department First"
                    : teachers.length === 0
                    ? "No Teachers Available"
                    : "Select Teacher ID"}
                </option>

                {teachers.map((teacher) => (
                  <option
                  key={teacher.teacherId}
                  value={teacher.teacherId}
                  >
                    {teacher.teacherId}
                  </option>
                ))}
              </select>
            </div>
              
            <div className="profile-field">
            <label htmlFor="teachername">Teacher Name</label>  
              <input type="text" name="teacherName"
                placeholder="Teacher Name"
                value={formData.teacherName}
                readOnly
                required
                />
            </div>  

            <div className="profile-field">
              <label htmlFor="teacherno">Teacher Number</label>
              <input type="text" name="teacherNo"
                placeholder="Teacher Number"
                maxLength="10"
                value={formData.teacherNo}
                readOnly
                required
                />
            </div>
            <div className="profile-field">
              <label htmlFor="college">College Name</label>
              <input type="text" name="college"
                placeholder="College"
                value={formData.college}
                readOnly
                required
                />
            </div>

            <div className="profile-field">
              <label htmlFor="semester">Semester</label>
              <input
                type="text"
                name="semester"
                placeholder="Semester (1-8)"
                maxLength="1"
                inputMode="numeric"
                pattern="[1-8]"
                value={formData.semester}
                onChange={handleChange}
                required
              />
            </div>
            <div className="profile-field">
              <label htmlFor="rollno">Roll Number</label>
              <input type="text" name="rollNo"
                placeholder="Roll Number"
                maxLength="10"
                value={formData.rollNo}
                onChange={handleChange}
                required
                />
            </div>
            
            <div className="profile-field">
              <label htmlFor="enrollno">Enrollment Number</label>
              <input type="text" name="enrollmentNumber"
                placeholder="Enrollment Number"
                maxLength="10"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                required
                />
            </div>
            
            <div className="profile-field">
              <label htmlFor="cgpa">CGPA</label>
              <input type="number" step="0.01" name="cgpa"
                placeholder="CGPA (e.g. 8.97, 10)"
                min="0" max="10"
                maxLength="2"
                value={formData.cgpa}
                onChange={handleChange}
                required
                />
            </div>

            </div>
          </div>

              {/* Buttons */}
          <div className="profile-buttons">
            <button type="submit" className="profile-btn" disabled={loading}>
              {!profileExists
                ? loading
                  ? "Saving..."
                  : "Save Profile"
                : loading
                ? "Updating..."
                : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default StudentProfile;