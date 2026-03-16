import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/esm/Container";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { fetchDoctorsList } from "../utils/ApiCall";
import { DatePicker } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  onError,
  onLoading,
  onLoadingClose,
  onSuccess,
} from "../utils/ErrorHandler";

const { RangePicker } = DatePicker;

const DoctorsList = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [range, setRange] = useState([]);
  const [search] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 15;
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [marksList, setMarksList] = useState({
    one: "",
    two: "",
    three: "",
    four: "",
    five: "",
    total: "",
  });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(null);
  const [show, setShow] = useState(false);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = Cookies.get(process.env.REACT_APP_TOKEN);

  const handleClose = () => {
    setErrors({});
    setShow(false);
  };
  const handleShow = () => setShow(true);

  // decode token to get role
  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setRole(decoded?.user_id);
    } catch (error) {
      console.log("Invalid token", error);
    }
  }, [token]);

  // load doctors list
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
        setDoctorsData(result.doctorsData2);
        setTotalPages(result.totalPages2);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, range]);

  const downloadFile = (doctor) => {
    const params = new URLSearchParams({
      fileUrl: doctor.file_path,
      maskedId: doctor.masked_id,
      country: doctor.country,
    });
    const url = `${baseUrl}/admin/download-doctor-file?${params.toString()}`;
    window.location.href = url;
  };

  // const downloadExcel = () => {
  //   window.location.href = `${baseUrl}/admin/download-participated-doctors-excel`;
  // };

  const handleAssignMarks = async (docId) => {
    setSelectedDocId(docId);
    const numberPart = docId.split("-")[1];
    const numericValue = Number(numberPart);

    try {
      const url = `${baseUrl}/admin/fetch-marks-list`;
      const headers = { Authorization: `Bearer ${token}` };
      const params = { doc_id: numericValue, evaluator_id: role };
      const res = await axios.get(url, { params, headers });
      const fetchedData = res?.data?.data[0];
      if (fetchedData) {
        setMarksList({
          one: fetchedData.one || "",
          two: fetchedData.two || "",
          three: fetchedData.three || "",
          four: fetchedData.four || "",
          five: fetchedData.five || "",
          total:
            Number(fetchedData.one || 0) +
            Number(fetchedData.two || 0) +
            Number(fetchedData.three || 0) +
            Number(fetchedData.four || 0) +
            Number(fetchedData.five || 0),
        });
      } else {
        setMarksList({
          one: "",
          two: "",
          three: "",
          four: "",
          five: "",
          total: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch marks:", error);
    }

    handleShow();
  };

  const handleMarkslist = (e) => {
    const { name, value } = e.target;

    // allow only digits and max 2 characters
    const regex = /^\d{0,2}$/;
    if (!regex.test(value)) return;

    setMarksList((prev) => {
      const updated = { ...prev, [name]: value };
      const total =
        Number(updated.one || 0) +
        Number(updated.two || 0) +
        Number(updated.three || 0) +
        Number(updated.four || 0) +
        Number(updated.five || 0);
      return { ...updated, total };
    });

    setErrors({ ...errors, [name]: "" });
  };

  // validate and submit on button click
  const handleSubmitMarks = async () => {
    const { one, two, three, four, five } = marksList;
    const newErrors = {};
    if (one === "" || Number(one) > 30)
      newErrors.one = "Enter the appropriate value.";
    if (two === "" || Number(two) > 20)
      newErrors.two = "Enter the appropriate value.";
    if (three === "" || Number(three) > 20)
      newErrors.three = "Enter the appropriate value.";
    if (four === "" || Number(four) > 15)
      newErrors.four = "Enter the appropriate value.";
    if (five === "" || Number(five) > 15)
      newErrors.five = "Enter the appropriate value.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const total =
      Number(one) + Number(two) + Number(three) + Number(four) + Number(five);
    const numberPart = selectedDocId.split("-")[1];
    const numericValue = Number(numberPart);

    try {
      const url = `${baseUrl}/admin/marks-list`;
      const headers = { Authorization: `Bearer ${token}` };
      onLoading();
      const body = {
        doc_id: numericValue,
        evaluator_id: role,
        one,
        two,
        three,
        four,
        five,
        total,
      };
      const res = await axios.post(url, body, { headers });
      if (res.status === 201) {
        onLoadingClose();
        onSuccess("Marks added successfully");
        loadDoctors();
        setMarksList({
          one: "",
          two: "",
          three: "",
          four: "",
          five: "",
          total: "",
        });
        handleClose();
      }
    } catch (error) {
      onLoadingClose();
      onError(error);
      console.log(error);
    }
  };

  return (
    <>
      <Modal show={show} size='lg' onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Marking list</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row'>
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>Masked text</label>
              <input
                type='text'
                className='form-control'
                value={selectedDocId}
                readOnly
              />
            </div>

            {/* Scientific Content */}
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>
                Scientific Content & Depth (Out of 30)
              </label>
              <input
                type='text'
                className='form-control'
                min={0}
                max={30}
                placeholder='Enter marks'
                onChange={handleMarkslist}
                name='one'
                value={marksList.one}
              />
              {errors.one && (
                <small className='text-danger'>{errors.one}</small>
              )}
            </div>

            {/* Structure */}
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>
                Structure, Style & Word Count (Out of 20)
              </label>
              <input
                type='text'
                className='form-control'
                min={0}
                max={20}
                placeholder='Enter marks'
                onChange={handleMarkslist}
                name='two'
                value={marksList.two}
              />
              {errors.two && (
                <small className='text-danger'>{errors.two}</small>
              )}
            </div>

            {/* Evidence */}
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>
                Evidence with Supporting Details (Out of 20)
              </label>
              <input
                type='text'
                className='form-control'
                min={0}
                max={20}
                placeholder='Enter marks'
                onChange={handleMarkslist}
                name='three'
                value={marksList.three}
              />
              {errors.three && (
                <small className='text-danger'>{errors.three}</small>
              )}
            </div>

            {/* Language */}
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>
                Language & Clarity of Message (Out of 15)
              </label>
              <input
                type='text'
                className='form-control'
                min={0}
                max={15}
                placeholder='Enter marks'
                onChange={handleMarkslist}
                name='four'
                value={marksList.four}
              />
              {errors.four && (
                <small className='text-danger'>{errors.four}</small>
              )}
            </div>

            {/* Originality */}
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>
                Originality (Out of 15)
              </label>
              <input
                type='text'
                className='form-control'
                min={0}
                max={15}
                placeholder='Enter marks'
                onChange={handleMarkslist}
                name='five'
                value={marksList.five}
              />
              {errors.five && (
                <small className='text-danger'>{errors.five}</small>
              )}
            </div>

            {/* Total */}
            <div className='col-md-6 mb-3'>
              <label className='form-label fw-semibold'>
                Total (Out of 100)
              </label>
              <input
                type='text'
                className='form-control'
                placeholder='Total marks'
                name='total'
                value={marksList.total}
                readOnly
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleSubmitMarks}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Doctors Table */}
      <Container className='mb-4'>
        <div className='d-flex justify-content-between mt-3'>
          <h4 className='mt-2'>Essay Submitted Users</h4>
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
                <th>Masked Id</th>
                <th>Essay</th>
                <th>Total words</th>
                <th>Submitted on</th>
                <th>Assign marks</th>
                <th>Total marks</th>
              </tr>
            </thead>
            <tbody>
              {doctorsData.map((each, i) => (
                <tr key={i}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td style={{ whiteSpace: "noWrap" }}>{each.masked_id}</td>
                  <td>
                    {each.file_path ? (
                      <button
                        className='border-0 text-primary bg-light'
                        onClick={() => downloadFile(each)}
                      >
                        <IoMdEye />
                      </button>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td>{each.total_words}</td>
                  <td>{each.submitted_on}</td>
                  <td>
                    <Button onClick={() => handleAssignMarks(each.masked_id)}>
                      Click
                    </Button>
                  </td>
                  <td>{each.total_marks ?? "--"}</td>
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
            <MdKeyboardArrowLeft /> Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            className='paginationBtn'
            onClick={() => setPage((p) => p + 1)}
          >
            Next <MdKeyboardArrowRight />
          </button>
        </div>
      </Container>
    </>
  );
};

export default DoctorsList;
