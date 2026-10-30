import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Badge,
  Row,
  Col,
  Spinner,
  Alert
} from "react-bootstrap";
import api from "../api/axios";

function WorkerDetails() {
  const { workerId } = useParams();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setReviewsError("");

      try {
        const response = await api.get(`/workers/${workerId}`);
        setWorker(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load worker profile");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/reviews/worker/${workerId}`);

        setReviews(response.data.reviews || []);
        setAverage(response.data.average || 0);
        setTotalReviews(response.data.total || 0);
      } catch (err) {
        setReviewsError(
          err.response?.data?.message || "Unable to load reviews"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workerId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !worker) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Worker not found"}</Alert>
      </Container>
    );
  }

  const services = Array.isArray(worker.services)
    ? worker.services.filter(
        (service) => service && service.isActive !== false
      )
    : [];

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Badge bg="primary" className="mb-3">
            Professional
          </Badge>

          <h2 className="fw-bold">{worker.name}</h2>
          <h5 className="text-primary mb-3">{worker.skill}</h5>

          <div className="mb-4">
            {totalReviews > 0 ? (
              <>
                <span className="text-warning fs-5">
                  {"★".repeat(Math.round(average))}
                  {"☆".repeat(5 - Math.round(average))}
                </span>

                <span className="ms-2 fw-bold">
                  {average}/5
                </span>

                <span className="text-muted ms-2">
                  ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
                </span>
              </>
            ) : (
              <span className="text-muted">
                ⭐ No ratings yet
              </span>
            )}
          </div>

          <Row>
            <Col md={6}>
              <p>
                <strong>Location:</strong> {worker.location}
              </p>

              <p>
                <strong>Experience:</strong> {worker.experience} years
              </p>
            </Col>

            <Col md={6}>
              <p>
                <strong>Availability:</strong>{" "}
                <Badge bg={worker.availability ? "success" : "secondary"}>
                  {worker.availability ? "Available" : "Unavailable"}
                </Badge>
              </p>

              <p>
                <strong>Hourly Rate:</strong> ₹{worker.hourlyRate}
              </p>
            </Col>
          </Row>

          <h5 className="fw-bold mt-3">About</h5>

          <p className="text-muted">
            {worker.description || "No description provided"}
          </p>
        </Card.Body>
      </Card>

      <h3 className="fw-bold mb-4">Services Offered</h3>

      {services.length === 0 ? (
        <Alert variant="info">
          This worker has no active services yet.
        </Alert>
      ) : (
        <Row className="g-4">
          {services.map((service) => (
            <Col md={6} key={service._id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4 d-flex flex-column">
                  <Badge
                    bg="primary"
                    className="align-self-start mb-3"
                  >
                    {service.category}
                  </Badge>

                  <h4 className="fw-bold">{service.name}</h4>

                  <p className="text-muted">
                    {service.description || "No description provided"}
                  </p>

                  <p>
                    <strong>Duration:</strong> {service.duration} minutes
                  </p>

                  <h4 className="text-success fw-bold mt-auto">
                    ₹{service.basePrice}
                  </h4>

                  <Button
                    as={Link}
                    to={`/book/${workerId}?serviceId=${service._id}`}
                    disabled={!worker.availability}
                    className="w-100 mt-3"
                  >
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-5">
        <h3 className="fw-bold mb-4">
          ⭐ Customer Reviews
          <span className="text-muted fs-5 ms-2">
            ({totalReviews})
          </span>
        </h3>

        {reviewsError && (
          <Alert variant="danger">{reviewsError}</Alert>
        )}

        {!reviewsError && reviews.length === 0 && (
          <Alert variant="info">
            No reviews yet. Be the first to review this professional!
          </Alert>
        )}

        <Row className="g-4">
          {reviews.map((review) => (
            <Col md={6} key={review._id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold mb-0">
                      {review.customer?.name || "Customer"}
                    </h5>

                    <Badge bg="warning" text="dark">
                      {review.rating}/5
                    </Badge>
                  </div>

                  <div className="text-warning fs-5 mb-3">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                  <p className="text-muted mb-0">
                    {review.comment || "No written feedback provided."}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
}

export default WorkerDetails;