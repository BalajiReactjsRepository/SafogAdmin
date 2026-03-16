import React, { useState } from "react";
import { useEffect } from "react";
import Cookies from "js-cookie";
import Table from "react-bootstrap/Table";

import Container from "react-bootstrap/esm/Container";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { fetchDoctorsList } from "../utils/ApiCall";
import Form from "react-bootstrap/Form";
import { FiSearch } from "react-icons/fi";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;

const DoctorsList = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [range, setRange] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const limit = 10;

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = Cookies.get(process.env.REACT_APP_TOKEN);

  const countryMap = {
    IN: "India",
    NP: "Nepal",
    LK: "Sri Lanka",
    BD: "Bangladesh",
    PK: "Pakistan",
    AFG: "Afghanistan",
    MV: "Maldives",
  };

  const loadDoctors = async () => {
    try {
      const result = await fetchDoctorsList({
        baseUrl,
        page,
        limit,
        token,
        range,
        search: debouncedSearch,
      });

      if (result) {
        setDoctorsData(result.doctorsData);
        setTotalPages(result.totalPages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page when new search
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, range]);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const downloadExcel = () => {
    window.location.href = `${baseUrl}/admin/download-registered-doctors-excel`;
  };

  return (
    <Container className='mb-4'>
      <div className='d-flex justify-content-between mt-3'>
        <h4 className='mt-2'>Registered Users</h4>
        <button
          className='btn bg-success text-light fw-semibold'
          onClick={downloadExcel}
        >
          Excel
        </button>
      </div>
      <div className='d-flex justify-content-between mt-3'>
        <div className='search-wrapper'>
          <FiSearch />
          <Form.Control
            maxLength={50}
            type='text'
            placeholder='Search by name, age, email, or country'
            onChange={handleChange}
          />
        </div>
        <RangePicker
          onChange={(dates, dateStrings) => {
            setRange(dateStrings);
          }}
        />
      </div>
      <div className='rounded-3 overflow-hidden border mt-4 table-cont'>
        <Table responsive>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Doctor name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Speciality</th>
              <th>Country</th>
              <th>Registered on</th>
              <th>Essay Status</th>
            </tr>
          </thead>
          <tbody>
            {doctorsData.map((each, i) => (
              <tr key={i}>
                <td>{(page - 1) * limit + i + 1}</td>
                <td>{each.doctor_name}</td>
                <td>{each.email}</td>
                <td>{each.age}</td>
                <td>{each.speciality}</td>
                <td>{countryMap[each.country] || each.country}</td>
                <td>{each.registered_on}</td>
                <td style={{ textAlign: "center" }}>{each.essay_submitted}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className='d-flex justify-content-center align-items-center gap-2 my-3'>
        <button
          disabled={page === 1}
          className='paginationBtn'
          onClick={() => setPage((p) => p - 1)}
        >
          <MdKeyboardArrowLeft />
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          className='paginationBtn'
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <MdKeyboardArrowRight />
        </button>
      </div>
    </Container>
  );
};

export default DoctorsList;
