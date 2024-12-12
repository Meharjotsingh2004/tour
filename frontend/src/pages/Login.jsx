



import React, { useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

import loginImg from "../assets/images/login.png";
import userIcon from "../assets/images/user.png";

import { AuthContext } from "./../context/AuthContext";
import { BASE_URL } from "./../utils/config";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: credentials.email }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.message);
      } else {
        setShowOtpInput(true);
        alert("OTP sent to your email");
      }
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...credentials, otp }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.message);
      } else {
        dispatch({ type: "LOGIN_SUCCESS", payload: result.data });
        alert("User Login Successful");
        navigate("/");
      }
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.message });
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login_container d-flex justify-content-between">
              <div className="login_img">
                <img src={loginImg} alt="" />
              </div>
              <div className="login_form">
                <div className="user">
                  <img src={userIcon} alt="" />
                </div>
                <h2>Login</h2>
                <Form onSubmit={showOtpInput ? handleLogin : handleRequestOtp}>
                  <FormGroup>
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      id="email"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      id="password"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  {showOtpInput && (
                    <FormGroup>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        required
                        id="otp"
                        onChange={handleOtpChange}
                      />
                    </FormGroup>
                  )}
                  <Button className="btn secondary_btn auth_btn" type="submit">
                    {showOtpInput ? "Login" : "Request OTP"}
                  </Button>
                </Form>
                <p>
                  Don't have an account? <Link to="/register">Create</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;

