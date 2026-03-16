import Cookies from "js-cookie";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const ProtectedRoute = (props) => {
  const tokenKey = process.env.REACT_APP_TOKEN || "token";
  const jwtToken = Cookies.get(tokenKey);
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwtToken) {
      navigate("/login");
    }
  }, [jwtToken, navigate]);

  if (!jwtToken) {
    return null;
  }

  return props.children ?? <Outlet />;
};

export default ProtectedRoute;
