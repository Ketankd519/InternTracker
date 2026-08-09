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

  const [verifying, setVerifying] =
    useState(false);



  useEffect(() => {

    fetchStudentDetails();

  }, [studentId]);



  const fetchStudentDetails = async () => {

    try {

      setLoading(true);


      const response =
        await api.get(
          `/manager/students/${studentId}`
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



  const handleVerify = async () => {

    const confirmed =
      window.confirm(
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



  if (loading) {

    return (

      <div className="manager-page">

        <div className="manager-loading">

          Loading student profile...

        </div>

      </div>

    );

  }



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



  const user = data?.user;

  const student = data?.student;

  const internship = data?.internship;



  return (

    <div className="manager-page">


      {/* =====================================
          BACK
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
          HEADER
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
                    {formatValue(value)}
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
                      {formatValue(value)}
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
// HELPERS
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



function formatValue(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "-";

  }


  if (
    typeof value === "boolean"
  ) {

    return value
      ? "Yes"
      : "No";

  }


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