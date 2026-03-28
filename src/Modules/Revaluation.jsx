import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/esm/Container";
import { IoMdEye } from "react-icons/io";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { jwtDecode } from "jwt-decode";
import {
  onError,
  onLoading,
  onLoadingClose,
  onSuccess,
} from "../utils/ErrorHandler";
import Modal from "react-bootstrap/Modal";

const Revaluation = () => {
  const [topPerformersList, setTopPerformersList] = useState([]);
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState(null);
  const [show, setShow] = useState(false);
  const [marksList, setMarksList] = useState({
    one: "",
    two: "",
    three: "",
    four: "",
    five: "",
    total: "",
  });
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

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

  useEffect(() => {
    const Revaluation = async () => {
      try {
        const url = `${baseUrl}/admin/acheivers-list`;
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const res = await axios.get(url, { headers });
        const resData = res?.data?.data;
        setTopPerformersList(resData);
      } catch (error) {
        console.log(error);
      }
    };
    Revaluation();
  }, [baseUrl, token]);

  const downloadFile = (doctor) => {
    const params = new URLSearchParams({
      fileUrl: doctor.file_path,
      maskedId: doctor.masked_id,
      country: doctor.country,
    });
    console.log(doctor, "balaji");
    const url = `${baseUrl}/admin/download-doctor-file?${params.toString()}`;
    window.location.href = url;
  };

  const handleAssignMarks = async (docId, adminId) => {
    setSelectedDocId(docId);
    setSelectedAdminId(adminId);
    // const numberPart = docId.split("-")[1];
    // const numericValue = Number(numberPart);

    try {
      const url = `${baseUrl}/admin/top-evaluation-marks`;
      const headers = { Authorization: `Bearer ${token}` };
      const params = { doc_id: docId, evaluator_id: adminId };
      const res = await axios.get(url, { params, headers });
      console.log(res);
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
      const url = `${baseUrl}/admin/evaluate-list`;
      const headers = { Authorization: `Bearer ${token}` };
      onLoading();
      const body = {
        doc_id: numericValue,
        evaluator_id: selectedAdminId,
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
        // loadDoctors();
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

  console.log(role);

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
                readOnly={role === 1001 ? true : false}
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
                readOnly={role === 1001 ? true : false}
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
                readOnly={role === 1001 ? true : false}
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
                readOnly={role === 1001 ? true : false}
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
                readOnly={role === 1001 ? true : false}
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
        {role !== 1001 && (
          <Modal.Footer>
            <Button variant='primary' onClick={handleSubmitMarks}>
              Save Changes
            </Button>
          </Modal.Footer>
        )}
      </Modal>
      <Container className='mb-4'>
        <div className='d-flex justify-content-between mt-3'>
          <h4 className='mt-2'>Top performers</h4>
        </div>

        <div className='rounded-3 overflow-hidden border mt-4 table-cont'>
          <Table responsive className=' table-bordered'>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Masked Id</th>
                <th>Essay</th>
                <th>Total words</th>
                <th>Eval-A Score</th>
                <th>Eval-B Score</th>
                <th>Eval-C Score</th>
                <th>Eval-D Score</th>
                <th>Eval-E Score</th>
                <th>Eval-F Score</th>
                <th>Eval-G Score</th>
                {role === 1001 && <th>Avg Score</th>}
              </tr>
            </thead>
            <tbody>
              {topPerformersList.length === 0 ? (
                <tr>
                  <td colSpan='12' className='text-center'>
                    No records found
                  </td>
                </tr>
              ) : (
                topPerformersList.map((each, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{each.masked_id}</td>
                    {/* <td>{each.assigned_admin_name}</td> */}
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
                    {/* <td className='text-center'>{each.total_marks ?? "--"}</td> */}
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1002)}
                        disabled={!(role === 1002 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1003)}
                        disabled={!(role === 1003 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1004)}
                        disabled={!(role === 1004 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1005)}
                        disabled={!(role === 1005 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1006)}
                        disabled={!(role === 1006 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1007)}
                        disabled={!(role === 1007 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleAssignMarks(each.masked_id, 1008)}
                        disabled={!(role === 1008 || role === 1001)}
                      >
                        View
                      </Button>
                    </td>
                    {role === 1001 && <td>{each.total_marks}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Container>
    </>
  );
};

export default Revaluation;
