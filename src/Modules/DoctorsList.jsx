import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import RegisteredUsers from "./RegisteredUsers";
import UnauthorizedModule from "./UnauthorizedModule";
import EssaySubmittedUsers from "./EssaySubmittedUsers";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { fetchDoctorsList } from "../utils/ApiCall";
import TopPerformers from "./TopPerformers";

const DoctorsList = () => {
  const [totalRecords, setRegisteredRecords] = useState(0);
  const [totalSubmissions, setSubmissionRecords] = useState(0);
  const [filteredData, setFilteredData] = useState("total");
  const [role, setRole] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = Cookies.get(process.env.REACT_APP_TOKEN);

  const loadDoctors = async () => {
    try {
      const result = await fetchDoctorsList({
        baseUrl,
        token,
      });

      if (result) {
        setSubmissionRecords(result?.submissionRecords || 0);
        setRegisteredRecords(result?.registeredRecords || 0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      setRole(decoded?.user_id);

      if (decoded?.user_id !== 1001) {
        setFilteredData("submissions");
      }
    } catch (error) {
      console.log("Invalid token", error);
    }
  }, [token]);

  const toggleData = (info) => {
    setFilteredData(info);
  };

  return (
    <Container className='mb-4'>
      <div className='d-flex justify-content-center gap-4 mt-3'>
        {role === 1001 ? (
          <>
            <div
              className={`text-center bg-light rounded-2 p-4 fw-semibold tab ${
                filteredData === "total" ? "active-tab" : ""
              }`}
              onClick={() => toggleData("total")}
            >
              User Registrations ({totalRecords})
            </div>

            <div
              className={`text-center bg-light rounded-2 p-4 fw-semibold tab ${
                filteredData === "submissions" ? "active-tab" : ""
              }`}
              onClick={() => toggleData("submissions")}
            >
              Essay Submissions ({totalSubmissions})
            </div>

            <div
              className={`text-center bg-light rounded-2 p-4 fw-semibold tab ${
                filteredData === "top-performers" ? "active-tab" : ""
              }`}
              onClick={() => toggleData("top-performers")}
            >
              Top Performers
            </div>
          </>
        ) : (
          <>
            <div
              className={`text-center bg-light rounded-2 p-4 fw-semibold tab ${
                filteredData === "submissions" ? "active-tab" : ""
              }`}
              onClick={() => toggleData("submissions")}
            >
              Essay Submissions ({totalSubmissions})
            </div>

            <div
              className={`text-center bg-light rounded-2 p-4 fw-semibold tab ${
                filteredData === "top-performers" ? "active-tab" : ""
              }`}
              onClick={() => toggleData("top-performers")}
            >
              Top Performers
            </div>
          </>
        )}
      </div>
      {role === 1001 ? (
        filteredData === "total" ? (
          <RegisteredUsers setRegisteredRecords={setRegisteredRecords} />
        ) : filteredData === "submissions" ? (
          <EssaySubmittedUsers setSubmissionRecords={setSubmissionRecords} />
        ) : (
          <TopPerformers />
        )
      ) : filteredData === "submissions" ? (
        <UnauthorizedModule setSubmissionRecords={setSubmissionRecords} />
      ) : (
        <TopPerformers />
      )}
    </Container>
  );
};

export default DoctorsList;
