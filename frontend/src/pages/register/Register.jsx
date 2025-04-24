// src/pages/register/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import axios from "axios";
import "./Register.css";
import hallo from "../../assets/hallo.svg";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    branch: "YTTA",
    batch: 12,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.email.includes("@")) {
        setError("Email tidak valid");
        return false;
      }
    } else if (currentStep === 2) {
      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter");
        return false;
      }
    } else if (currentStep === 3) {
      if (formData.password !== formData.confirmPassword) {
        setError("Password dan konfirmasi password tidak sama");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateStep()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://probwe.rikpetik.site/api/v1/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal. Coba lagi.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Masukkan email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
        );
      case 2:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Masukkan password (min 6 karakter)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
        );
      case 3:
        return (
          <Form.Group className="mb-3">
            <Form.Label>Konfirmasi Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Masukkan kembali password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="register-card shadow-lg">
        <Row className="g-0 h-100">
          {/* Kiri: Form */}
          <Col
            xs={12}
            md={6}
            className="p-4 bg-white d-flex flex-column justify-content-center"
          >
            <h3 className="text-center mb-4" style={{ color: "#112ba6" }}>
              Daftar Akun Baru
            </h3>

            <ProgressBar
              now={(currentStep / 3) * 100}
              className="mb-4"
              variant="primary"
              style={{ backgroundColor: "#e9ecef", height: "10px" }}
            />

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form
              onSubmit={
                currentStep === 3 ? handleSubmit : (e) => e.preventDefault()
              }
            >
              {renderStep()}

              <div className="d-flex justify-content-between mt-4">
                {currentStep > 1 ? (
                  <Button
                    variant="outline-primary"
                    onClick={prevStep}
                    style={{ width: "48%" }}
                  >
                    Kembali
                  </Button>
                ) : (
                  <div style={{ width: "48%" }}></div>
                )}

                {currentStep < 3 ? (
                  <Button
                    onClick={nextStep}
                    style={{
                      width: "48%",
                      backgroundColor: "#112ba6",
                      border: "none",
                    }}
                  >
                    Lanjut
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    style={{
                      width: "48%",
                      backgroundColor: "#112ba6",
                      border: "none",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Daftar"}
                  </Button>
                )}
              </div>
            </Form>

            <div className="text-center mt-4">
              <span>Sudah punya akun? </span>
              <Link
                to="/"
                
              >
                Login disini
              </Link>
            </div>
          </Col>

          {/* Kanan: Ilustrasi */}
          <Col
            md={6}
            className="register-image d-none d-md-flex flex-column justify-content-center align-items-center p-4"
          >
            <h2 className="text-center mb-4" style={{ color: "#112ba6" }}>
              Bergabunglah Dengan Kami
            </h2>
            <img
              src={hallo}
              alt="hallo"
              className="img-fluid"
              style={{ maxHeight: "300px", width: "auto" }}
            />
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Register;
