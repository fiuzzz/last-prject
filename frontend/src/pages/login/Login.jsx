// src/pages/login/Login.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import "./Login.css"; // kita custom dikit pakai CSS
import hallo from "../../assets/hallo.svg";
import { getCurrentUser } from "../../utils/auth";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.includes("@")) {
      setError("Email tidak valid.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    try {
      const response = await axios.post(
        "https://probwe.rikpetik.site/api/v1/login",
        {
          identifier,
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "user") {
        navigate("/home");
      } else {
        setError("Role tidak dikenali.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Coba lagi.");
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "user") {
        navigate("/home");
      }
      return;
    }
  });

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="login-card shadow-lg">
        <Row className="g-0 h-100">
          {/* Kiri: Ilustrasi */}
          <Col
            md={6}
            className="login-image d-none d-md-flex flex-column justify-content-center align-items-center p-4"
          >
            <h2 className="text-center mb-4" style={{ color: "#112ba6" }}>
              Selamat datang sahabat
            </h2>
            <img
              src={hallo}
              alt="Login Illustration"
              className="img-fluid"
              style={{ maxHeight: "300px", width: "auto" }}
            />
          </Col>

          {/* Kanan: Form */}
          <Col
            xs={12}
            md={6}
            className="p-4 bg-white d-flex flex-column justify-content-center"
          >
            <h3 className="text-center mb-4" style={{ color: "#112ba6" }}>
              Login
            </h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Masukkan email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100"
                style={{ backgroundColor: "#112ba6", border: "none" }}
              >
                Login
              </Button>
              <div>
                <p className="text-center mt-3">
                  Belum punya akun? <Link to="/register">Daftar disini</Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Login;
