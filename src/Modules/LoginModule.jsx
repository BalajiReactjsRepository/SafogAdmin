import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useState } from "react";
import Card from "react-bootstrap/Card";
import axios from "axios";
import Cookies from "js-cookie";
import InputGroup from "react-bootstrap/InputGroup";
import { useNavigate } from "react-router-dom";
import {
  // onSuccess,
  onError,
  onLoading,
  onLoadingClose,
} from "../utils/ErrorHandler";
import "./login.css";

const LoginModule = () => {
  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const tokenKey = process.env.REACT_APP_TOKEN;
  const navigate = useNavigate();

  const handleValues = (e) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value.trim() }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = values;
    if (!username || !password) {
      setError("Fill the credentials");
      return;
    }
    try {
      const url = `${baseUrl}/admin/login`;
      const { username, password } = values;
      onLoading();
      const res = await axios.post(url, { username, password });
      if (res.status === 200) {
        onLoadingClose();
        Cookies.set(tokenKey, res?.data?.token);
        navigate("/doctors-list");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong";
      onLoadingClose();
      onError({ message: message });
    }
  };

  return (
    <Container>
      {/* <div className='vh-100 d-flex flex-column justify-content-center align-items-center'>
        <h4 className='my-4'>Admin Login</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className='mb-3' controlId='username'>
            <Form.Label>Employee ID</Form.Label>
            <Form.Control
              onChange={handleValues}
              value={values.username}
              type='text'
              placeholder='Enter Employee ID'
            />
          </Form.Group>
          <Form.Group className='mb-2' controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              onChange={handleValues}
              value={values.password}
              type='password'
              placeholder='Password'
            />
          </Form.Group>
          {error && <span className='d-block text-danger'>{error}</span>}
          <Button variant='primary' type='submit' className='mt-2'>
            Submit
          </Button>
        </Form>
      </div> */}
      <div className='d-flex justify-content-center align-items-center vh-100 loginBg'>
        <Card className='loginCard' style={{ width: "22rem" }}>
          <Card.Body>
            <div className='text-center mb-4'>
              {/* <img className='logo' src={hetero} alt='logo' /> */}
              <h4 className='text-center mt-2'>Login</h4>
            </div>

            <Form>
              <Form.Group className='mb-3' controlId='username'>
                <Form.Label className='fw-semibold'>User ID</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='User id'
                  value={values.userId}
                  onChange={handleValues}
                  maxLength={5}
                />
              </Form.Group>

              <Form.Group className='mb-3' controlId='password'>
                <Form.Label className='fw-semibold'>Password</Form.Label>

                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder='Password'
                    value={values.password}
                    onChange={handleValues}
                    maxLength={20}
                  />
                  <Button
                    variant='outline-secondary'
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Form>
            {error && <span className='d-block text-danger'>{error}</span>}
            <div className='text-center'>
              <button className='btn cust-btn' onClick={handleSubmit}>
                Login
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>
      ;
    </Container>
  );
};

export default LoginModule;
