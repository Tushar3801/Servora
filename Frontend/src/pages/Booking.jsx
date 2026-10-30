import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../api/axios";

function Booking() {
  const { workerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceId = searchParams.get("serviceId");

  const [worker, setWorker] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    serviceDate: "",
    serviceTime: "",
    address: "",
    description: ""
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [workerRes, serviceRes] = await Promise.all([
          api.get(`/workers/${workerId}`),
          api.get(`/services/${serviceId}`)
        ]);

        if (
          String(serviceRes.data.worker?._id || serviceRes.data.worker) !== String(workerId) ||
          serviceRes.data.isActive === false
        ) {
          setError("This service is not available for the selected worker");
          return;
        }

        setWorker(workerRes.data);
        setService(serviceRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load booking details");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchDetails();
    } else {
      setError("No service selected");
      setLoading(false);
    }
  }, [workerId, serviceId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/bookings",
        {
          worker: workerId,
          serviceId,
          ...formData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <Card.Body className="p-4">
          <h2 className="fw-bold mb-4">Book Professional</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          {worker && service && (
            <>
              <Card className="bg-light border-0 mb-4">
                <Card.Body>
                  <h5 className="fw-bold">{service.name}</h5>
                  <p className="mb-2">
                    <strong>Worker:</strong> {worker.name}
                  </p>
                  <p className="mb-2">
                    <strong>Duration:</strong> {service.duration} minutes
                  </p>
                  <h4 className="text-success fw-bold mb-0">
                    ₹{service.basePrice}
                  </h4>
                </Card.Body>
              </Card>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Service Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="serviceDate"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={formData.serviceDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Service Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="serviceTime"
                    value={formData.serviceTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Service Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Additional Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Describe your requirements (optional)"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Booking;