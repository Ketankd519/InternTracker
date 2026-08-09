import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
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
  cgpa: "",

  profilePhoto: "",
};

const StudentProfile = () => {
  const [formData, setFormData] =
    useState(emptyForm);

  // Comes ONLY from users collection
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });

  const [profileExists, setProfileExists] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // Fetch Profile
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFetching(true);
        setError("");

        const response =
          await API.get("/students/profile");

        const result = response.data;

        console.log(
          "Student Profile:",
          result
        );

        const user = result.data?.user;

        // ========================================
        // USER DATA
        // From users collection
        // ========================================

        setUserData({
          name: user?.name || "",
          email: user?.email || "",
        });

        // ========================================
        // NEW USER
        // ========================================

        if (!result.profileExists) {
          setProfileExists(false);
          setFormData(emptyForm);
          return;
        }

        // ========================================
        // EXISTING PROFILE
        // ========================================

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
          department:
            data.department || "",

          semester:
            data.semester ?? "",

          rollNo:
            data.rollNo || "",

          enrollmentNumber:
            data.enrollmentNumber || "",

          teacherId:
            data.teacherId?._id ||
            data.teacherId ||
            "",

          cgpa:
            data.cgpa ?? "",

          profilePhoto:
            data.profilePhoto || "",
        });
      } catch (err) {
        console.error(
          "Fetch Student Profile Error:",
          err
        );

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

  // ==========================================
  // Handle Input
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
      files,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files
        ? files[0]
        : value,
    }));
  };

  // ==========================================
  // Create / Update
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = new FormData();

      // ========================================
      // Student Details
      // ========================================

      data.append(
        "phone",
        formData.phone
      );

      if (formData.dob) {
        data.append(
          "dob",
          formData.dob
        );
      }

      if (formData.gender) {
        data.append(
          "gender",
          formData.gender
        );
      }

      data.append(
        "address",
        formData.address
      );

      data.append(
        "city",
        formData.city
      );

      data.append(
        "state",
        formData.state
      );

      data.append(
        "pincode",
        formData.pincode
      );

      // ========================================
      // Academic Details
      // ========================================

      data.append(
        "college",
        formData.college
      );

      data.append(
        "department",
        formData.department
      );

      data.append(
        "semester",
        formData.semester
      );

      data.append(
        "rollNo",
        formData.rollNo
      );

      data.append(
        "enrollmentNumber",
        formData.enrollmentNumber
      );

      if (
        formData.teacherId.trim() !== ""
      ) {
        data.append(
          "teacherId",
          formData.teacherId
        );
      }

      if (formData.cgpa !== "") {
        data.append(
          "cgpa",
          formData.cgpa
        );
      }

      // ========================================
      // Profile Photo
      // ========================================

      if (
        formData.profilePhoto instanceof
        File
      ) {
        data.append(
          "profilePhoto",
          formData.profilePhoto
        );
      }

      let response;

      // ========================================
      // CREATE
      // ========================================

      if (!profileExists) {
        response = await API.post(
          "/students/profile",
          data
        );
      }

      // ========================================
      // UPDATE
      // ========================================

      else {
        response = await API.put(
          "/students/profile",
          data
        );
      }

      console.log(
        "Student Profile Response:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Profile saved successfully."
      );

      // ========================================
      // Refresh from MongoDB
      // ========================================

      const refreshed =
        await API.get(
          "/students/profile"
        );

      const result = refreshed.data;

      setProfileExists(
        result.profileExists
      );

      const user =
        result.data?.user;

      setUserData({
        name: user?.name || "",
        email: user?.email || "",
      });

      if (result.profileExists) {
        const profile =
          result.data;

        setFormData({
          phone:
            profile.phone || "",

          dob: profile.dob
            ? new Date(profile.dob)
                .toISOString()
                .split("T")[0]
            : "",

          gender:
            profile.gender || "",

          address:
            profile.address || "",

          city:
            profile.city || "",

          state:
            profile.state || "",

          pincode:
            profile.pincode || "",

          college:
            profile.college || "",

          department:
            profile.department || "",

          semester:
            profile.semester ?? "",

          rollNo:
            profile.rollNo || "",

          enrollmentNumber:
            profile.enrollmentNumber ||
            "",

          teacherId:
            profile.teacherId?._id ||
            profile.teacherId ||
            "",

          cgpa:
            profile.cgpa ?? "",

          profilePhoto:
            profile.profilePhoto || "",
        });
      }
    } catch (err) {
      console.error(
        "Student Profile Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save student profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (fetching) {
    return (
      <StudentLayout>
        <div className="profile-page">
          <div className="profile-header">
            <h1>
              Student Profile
            </h1>

            <p>
              Loading your profile...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <StudentLayout>
      <div className="profile-page">

        <div className="profile-header">
          <h1>
            Student Profile
          </h1>

          <p>
            Complete your personal and
            academic information.
          </p>
        </div>

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
          className="profile-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              Personal Details
          ========================== */}

          <div className="profile-section">

            <h2>
              Personal Details
            </h2>

            <div className="profile-grid">

              {/* USERS collection */}

              <input
                type="text"
                name="fullName"
                value={userData.name}
                readOnly
                placeholder="Full Name"
              />

              <input
                type="email"
                name="email"
                value={userData.email}
                readOnly
                placeholder="Email"
              />

              {/* STUDENTS collection */}

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
              />

              <textarea
                rows="4"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <div className="photo-upload">

                <label>
                  Profile Photo
                </label>

                <input
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handleChange}
                />

              </div>

            </div>
          </div>

          {/* =========================
              Academic Details
          ========================== */}

          <div className="profile-section">

            <h2>
              Academic Details
            </h2>

            <div className="profile-grid">

              <input
                type="text"
                name="college"
                placeholder="College"
                value={formData.college}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="semester"
                placeholder="Semester"
                min="1"
                value={formData.semester}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="rollNo"
                placeholder="Roll Number"
                value={formData.rollNo}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="enrollmentNumber"
                placeholder="Enrollment Number"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="teacherId"
                placeholder="Teacher ID (Optional)"
                value={formData.teacherId}
                onChange={handleChange}
              />

              <input
                type="number"
                step="0.01"
                name="cgpa"
                placeholder="CGPA"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleChange}
              />

            </div>
          </div>

          {/* =========================
              Buttons
          ========================== */}

          <div className="profile-buttons">

            <button
              type="submit"
              className="profile-btn"
              disabled={loading}
            >
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
    </StudentLayout>
  );
};

export default StudentProfile;