import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/esm/Container";
import { IoMdEye } from "react-icons/io";
import axios from "axios";

const TopPerformers = () => {
  const [topPerformersList, setTopPerformersList] = useState([]);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = Cookies.get(process.env.REACT_APP_TOKEN);

  useEffect(() => {
    const topPerformers = async () => {
      try {
        const url = `${baseUrl}/admin/top-performers-list`;
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
    topPerformers();
  }, [baseUrl, token]);

  const downloadFile = (doctor) => {
    const params = new URLSearchParams({
      fileUrl: doctor.file_path,
      maskedId: doctor.masked_id,
      country: doctor.country,
    });
    const url = `${baseUrl}/admin/download-doctor-file?${params.toString()}`;
    window.location.href = url;
  };

  return (
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
              <th>Evaluator name</th>
              <th>Essay</th>
              <th>Total words</th>
              <th>Submitted on</th>
              <th>Scientific Content & Depth (Out of 30)</th>
              <th>Structure, Style & Word Count (Out of 20)</th>
              <th>Evidence with Supporting Details (Out of 20)</th>
              <th>Language & Clarity of Message (Out of 15)</th>
              <th>Originality (Out of 15)</th>
              <th>Total marks</th>
            </tr>
          </thead>
          {/* <tbody>
            {topPerformersList.map((each, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td style={{ whiteSpace: "noWrap" }}>{each.masked_id}</td>
                <td>{each.assigned_admin_name}</td>
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
                <td className='text-center'>{each.one}</td>
                <td className='text-center'>{each.two}</td>
                <td className='text-center'>{each.three}</td>
                <td className='text-center'>{each.four}</td>
                <td className='text-center'>{each.five}</td>
                <td className='text-center'>{each.total_marks ?? "--"}</td>
              </tr>
            ))}
          </tbody> */}
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
                  <td>{each.assigned_admin_name}</td>
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
                  <td className='text-center'>{each.one}</td>
                  <td className='text-center'>{each.two}</td>
                  <td className='text-center'>{each.three}</td>
                  <td className='text-center'>{each.four}</td>
                  <td className='text-center'>{each.five}</td>
                  <td className='text-center'>{each.total_marks ?? "--"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default TopPerformers;
