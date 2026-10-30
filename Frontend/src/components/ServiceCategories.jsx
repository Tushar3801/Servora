import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import api from "../api/axios";

function ServiceCategories() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await api.get("/services/getServices");

        const uniqueServices = [
          ...new Map(
            response.data
              .filter((service) => service.isActive)
              .map((service) => [
                service.name.trim().toLowerCase(),
                service,
              ])
          ).values(),
        ];

        setServices(uniqueServices);
      } catch (error) {
        setError("Unable to load services.");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <section className="py-5">
      <Container>
        <h2 className="text-center fw-bold mb-2">
          Explore Our Services
        </h2>

        <p className="text-center text-secondary mb-5">
          Discover services available on Servora.
        </p>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <Row className="g-4">
            {services.map((service) => (
              <Col md={4} sm={6} key={service._id}>
                <Card className="h-100 border-0 shadow-sm p-3">
                  <Card.Body>
                    <h4 className="fw-bold">{service.name}</h4>

                    <p className="text-secondary">
                      {service.description}
                    </p>

                    <p className="mb-2">
                      <strong>Category:</strong> {service.category}
                    </p>

                    <p className="text-primary fw-bold mb-0">
                      Starting from ₹{service.basePrice}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
}

export default ServiceCategories;