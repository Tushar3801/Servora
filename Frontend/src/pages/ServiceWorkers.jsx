import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import api from "../api/axios";

function ServiceWorkers() {
  const { serviceId } = useParams();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const response = await api.get("/workers");

        const filteredWorkers = response.data.filter((worker) =>
          worker.services?.some(
            (service) => (service._id || service) === serviceId
          )
        );

        setWorkers(filteredWorkers);
      } catch (error) {
        setError("Unable to load workers.");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
  }, [serviceId]);

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">Available Professionals</h2>

      {loading && <Spinner animation="border" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && workers.length === 0 && (
        <Alert variant="info">
          No professionals are currently available for this service.
        </Alert>
      )}

      <Row className="g-4">
        {workers.map((worker) => (
          <Col md={4} key={worker._id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold">
                  {worker.name}
                </Card.Title>

                <p><strong>Skill:</strong> {worker.skill}</p>
                <p><strong>Experience:</strong> {worker.experience} years</p>
                <p><strong>Location:</strong> {worker.location}</p>

                <p className="text-primary fw-bold">
                  ₹{worker.hourlyRate}/hour
                </p>

                <Button as={Link} to={`/workers/${worker._id}`}>
                  View Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ServiceWorkers;
