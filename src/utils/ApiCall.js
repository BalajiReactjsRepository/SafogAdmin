import axios from "axios";

export const fetchDoctorsList = async ({
  baseUrl,
  page,
  limit,
  token,
  range,
  search,
}) => {
  try {
    const url = `${baseUrl}/admin/doctors-list`;

    const params = {
      page,
      limit,
      startDate: range?.[0] || "",
      endDate: range?.[1] || "",
      search: search || "",
    };

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const res = await axios.get(url, {
      params,
      headers,
    });

    if (res.status === 200) {
      return {
        doctorsData: res.data?.data,
        doctorsData2: res.data?.submissionData,
        totalPages: res.data?.pagination?.totalPages,
        totalPages2: res.data?.pagination?.totalSubmissionPages,
        submissionRecords: res.data?.pagination?.essaySubmissions,
        registeredRecords: res.data?.pagination?.totalRecords,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching doctors list:", error);
    throw error;
  }
};
