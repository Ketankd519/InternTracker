import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

import "./ManagerStyle.css";


export default function ManagerViewStudent() {

  const { studentId } = useParams();

  const navigate = useNavigate();


  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [verifying, setVerifying] = useState(false);


  // ==========================================
  // FETCH STUDENT DETAILS
  // ==========================================

  useEffect(() => {

    fetchStudentDetails();

  }, [studentId]);


  const fetchStudentDetails = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await api.get(
        `/manager/students/${studentId}`
      );


      console.log(
        "Manager Student Details:",
        response.data
      );


      setData(
        response.data.student
      );


    } catch (error) {

      console.error(
        "Manager Student Details Error:",
        error
      );


      setError(
        error.response?.data?.message ||
        "Failed to load student details"
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // VERIFY STUDENT INTERNSHIP
  // ==========================================

  const handleVerify = async () => {

    const confirmed = window.confirm(
      "Are you sure you want to verify this student's internship?"
    );


    if (!confirmed) {
      return;
    }


    try {

      setVerifying(true);


      await api.put(
        `/manager/students/${studentId}/verify`
      );


      alert(
        "Student internship verified successfully."
      );


      await fetchStudentDetails();


    } catch (error) {

      console.error(
        "Manager Verification Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to verify student internship."
      );


    } finally {

      setVerifying(false);

    }

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="manager-page">

        <div className="manager-loading">

          Loading student profile...

        </div>

      </div>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="manager-page">

        <button
          className="manager-back-btn"
          onClick={() =>
            navigate("/manager/approvals")
          }
        >
          ← Back to Approvals
        </button>


        <div className="manager-error">

          {error}

        </div>

      </div>

    );

  }


  // ==========================================
  // DATA
  // ==========================================

  const user = data?.user;

  const student = data?.student;

  const internship = data?.internship;


  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  const profilePhoto = getProfilePhotoUrl(
    student?.profilePhoto
  );


  return (

    <div className="manager-page">


      {/* =====================================
          BACK BUTTON
      ===================================== */}

      <button
        className="manager-back-btn"
        onClick={() =>
          navigate("/manager/approvals")
        }
      >

        ← Back to Approvals

      </button>



      {/* =====================================
          PROFILE HEADER
      ===================================== */}

      <div className="manager-student-profile-header">


        {/* PROFILE PHOTO */}

        <div className="manager-student-profile-photo-wrapper">

          {profilePhoto ? (

            <img
              src={profilePhoto}
              alt={`${user?.name || "Student"} profile`}
              className="manager-student-profile-photo"

              onError={(e) => {

                console.error(
                  "Manager Profile Image Failed:",
                  profilePhoto
                );

                e.currentTarget.style.display = "none";

                const placeholder =
                  e.currentTarget.nextSibling;

                if (placeholder) {
                  placeholder.style.display = "flex";
                }

              }}
            />

          ) : null}


          {/* DEFAULT AVATAR */}

          <div
            className="manager-student-profile-placeholder"
            style={{
              display: profilePhoto
                ? "none"
                : "flex",
            }}
          >

            👨‍🎓

          </div>

        </div>


        {/* PROFILE INFORMATION */}

        <div className="manager-student-profile-info">

          <h1>
            {user?.name || "Student"}
          </h1>


          <p className="manager-student-profile-email">

            {user?.email || "-"}

          </p>


          <div className="manager-student-profile-meta">


            <span className="manager-student-role-badge">

              {user?.role || "Student"}

            </span>


            {internship?.managerVerified ? (

              <span className="manager-verified-badge">

                ✓ Internship Verified

              </span>

            ) : (

              <span className="manager-not-verified-badge">

                Not Verified

              </span>

            )}

          </div>

        </div>

      </div>



      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="manager-page-header">

        <div>

          <h1>
            Student Profile
          </h1>

          <p>
            Review complete student and
            internship information.
          </p>

        </div>

      </div>



      {/* =====================================
          ACCOUNT INFORMATION
      ===================================== */}

      <div className="manager-detail-card">

        <div className="manager-detail-header">

          <h2>
            Account Information
          </h2>

        </div>


        <div className="manager-detail-grid">


          <div className="manager-detail-item">

            <label>
              Name
            </label>

            <p>
              {user?.name || "-"}
            </p>

          </div>


          <div className="manager-detail-item">

            <label>
              Email
            </label>

            <p>
              {user?.email || "-"}
            </p>

          </div>


          <div className="manager-detail-item">

            <label>
              Role
            </label>

            <p>
              {user?.role || "-"}
            </p>

          </div>


        </div>

      </div>



      {/* =====================================
          STUDENT INFORMATION
      ===================================== */}

      <div className="manager-detail-card">

        <div className="manager-detail-header">

          <h2>
            Student Information
          </h2>

        </div>


        <div className="manager-detail-grid">


          {Object.entries(
            student || {}
          )

            .filter(
              ([key]) =>
                ![
                  "_id",
                  "user",
                  "__v",
                  "createdAt",
                  "updatedAt",
                  "profilePhoto",
                ].includes(key)
            )

            .map(
              ([key, value]) => (

                <div
                  className="manager-detail-item"
                  key={key}
                >

                  <label>
                    {formatLabel(key)}
                  </label>

                  <p>
                    {formatValue(
                      value,
                      key
                    )}
                  </p>

                </div>

              )
            )}


        </div>

      </div>



      {/* =====================================
          INTERNSHIP INFORMATION
      ===================================== */}

      <div className="manager-detail-card">

        <div className="manager-detail-header">

          <h2>
            Internship Information
          </h2>

        </div>


        {!internship ? (

          <div className="manager-empty-details">

            No internship information found.

          </div>

        ) : (

          <div className="manager-detail-grid">


            {Object.entries(
              internship
            )

              .filter(
                ([key]) =>
                  ![
                    "_id",
                    "student",
                    "__v",
                    "createdAt",
                    "updatedAt",
                  ].includes(key)
              )

              .map(
                ([key, value]) => (

                  <div
                    className="manager-detail-item"
                    key={key}
                  >

                    <label>
                      {formatLabel(key)}
                    </label>

                    <p>
                      {formatValue(
                        value,
                        key
                      )}
                    </p>

                  </div>

                )
              )}


          </div>

        )}

      </div>



      {/* =====================================
          MANAGER VERIFICATION
      ===================================== */}

      <div className="manager-verification-card">

        <div>

          <h2>
            Manager Verification
          </h2>

          <p>
            Verify this student's internship
            information after reviewing the
            submitted details.
          </p>

        </div>


        {internship?.managerVerified ? (

          <button
            className="manager-verified-button"
            disabled
          >

            ✓ Internship Verified

          </button>

        ) : (

          <button
            className="manager-verify-button"
            onClick={handleVerify}
            disabled={
              verifying || !internship
            }
          >

            {verifying
              ? "Verifying..."
              : "Verify Internship"}

          </button>

        )}

      </div>


    </div>

  );

}



// ============================================
// PROFILE PHOTO URL
// ============================================

function getProfilePhotoUrl(photo) {

  if (!photo) {
    return null;
  }


  // Convert Windows path to normal URL path

  let cleanPhoto = photo
    .replace(/\\/g, "/");


  // Complete URL

  if (
    cleanPhoto.startsWith("http://") ||
    cleanPhoto.startsWith("https://")
  ) {

    return cleanPhoto;

  }


  // Remove leading slash

  cleanPhoto = cleanPhoto.replace(
    /^\/+/,
    ""
  );


  // If database contains:
  // uploads/profile/filename.jpg

  if (
    cleanPhoto.startsWith("uploads/")
  ) {

    return `http://localhost:5000/${cleanPhoto}`;

  }


  // If database contains:
  // profile/filename.jpg

  if (
    cleanPhoto.startsWith("profile/")
  ) {

    return `http://localhost:5000/uploads/${cleanPhoto}`;

  }


  // If database contains only:
  // filename.jpg

  return `http://localhost:5000/uploads/profile/${cleanPhoto}`;

}



// ============================================
// FORMAT LABEL
// ============================================

function formatLabel(key) {

  return key

    .replace(
      /([A-Z])/g,
      " $1"
    )

    .replace(
      /^./,
      (str) =>
        str.toUpperCase()
    );

}



// ============================================
// FORMAT VALUE
// ============================================

function formatValue(
  value,
  key = ""
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "-";

  }


  // ========================================
  // DATE FIELDS
  // ========================================

  if (
    isDateField(key, value)
  ) {

    return formatDate(value);

  }


  // ========================================
  // BOOLEAN
  // ========================================

  if (
    typeof value === "boolean"
  ) {

    return value
      ? "Yes"
      : "No";

  }


  // ========================================
  // OBJECT / ARRAY
  // ========================================

  if (
    typeof value === "object"
  ) {

    if (
      Array.isArray(value)
    ) {

      return value.join(", ");

    }


    return JSON.stringify(value);

  }


  return value.toString();

}



// ============================================
// CHECK DATE FIELD
// ============================================

function isDateField(
  key,
  value
) {

  const dateKeys = [

    "dob",

    "dateOfBirth",

    "startDate",

    "endDate",

    "joiningDate",

    "completionDate",

    "internshipStartDate",

    "internshipEndDate",

    "submissionDate",

    "createdAt",

    "updatedAt",

  ];


  if (
    dateKeys.includes(key)
  ) {

    return true;

  }


  // Also detect ISO date strings

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {

    return true;

  }


  return false;

}



// ============================================
// FORMAT DATE
// ============================================

function formatDate(date) {

  if (!date) {
    return "-";
  }


  const parsedDate =
    new Date(date);


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return "-";

  }


  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}