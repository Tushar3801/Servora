import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Services() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/services/getServices");
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) => {
    const keyword = search.toLowerCase().trim();

    return [
      service.name,
      service.category,
      service.worker?.name,
      service.worker?.skill,
      service.worker?.location
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
  });

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Find Your Professional</h1>
        <p className="text-muted">
          Explore services offered by skilled professionals on Servora.
        </p>
      </div>

      <Form.Control
        type="text"
        placeholder="Search electrician, plumbing, teaching, location..."
        className="mb-4 p-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && filteredServices.length === 0 && (
        <Alert variant="info">No matching services found.</Alert>
      )}

      <Row className="g-4">
        {!loading && filteredServices.map((service) => (
          <Col md={6} lg={4} key={service._id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4 d-flex flex-column">
                <Badge bg="primary" className="mb-3 align-self-start">
                  {service.category}
                </Badge>

                <h4 className="fw-bold">{service.name}</h4>

                <p className="text-muted">
                  {service.description || "Professional service"}
                </p>

                <hr />

                <h5 className="fw-bold">
                  {service.worker?.name || "Professional"}
                </h5>

                <p className="mb-1">
                  <strong>Profession:</strong> {service.worker?.skill || "Not specified"}
                </p>

                <p className="mb-1">
                  <strong>Location:</strong> {service.worker?.location || "Not specified"}
                </p>

                <p className="mb-1">
                  <strong>Experience:</strong> {service.worker?.experience ?? 0} years
                </p>

                <p className="mb-2">
                  <strong>Duration:</strong> {service.duration} minutes
                </p>

                <p className="mb-3">
                  <strong>Availability:</strong>{" "}
                  <Badge bg={service.worker?.availability ? "success" : "secondary"}>
                    {service.worker?.availability ? "Available" : "Unavailable"}
                  </Badge>
                </p>

                <h4 className="text-success fw-bold mt-auto">
                  ₹{service.basePrice}
                </h4>

                {service.worker?._id && (
                  <Button
                    as={Link}
                    to={`/workers/${service.worker._id}`}
                    className="w-100 mt-3"
                  >
                    View Worker
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Services;