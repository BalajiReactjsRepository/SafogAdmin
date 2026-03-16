import Swal from "sweetalert2";
import Cookies from "js-cookie";
export const onLoading = () => Swal.showLoading();

export const onLoadingClose = () => Swal.close();
export const onSuccess = ({ message = "" }) => {
  console.log(message);
  return Swal.fire({
    icon: "success",
    title: message || "Your work has been saved",
    showConfirmButton: false,
    timer: 1500,
  });
};

export const onError = (error) => {
  if (
    error.response &&
    (error.response.status === 401 ||
      error.response.status === 440 ||
      error.response.status === 408)
  ) {
    Cookies.remove(process.env.REACT_APP_TOKEN);
    return window.location.replace("/safog");
  }
  return Swal.fire({
    icon: "error",
    title: "Oops...",
    text: error.response ? error.response.data.message : error.message,
  });
};
