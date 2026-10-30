import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Button,
  Form
} from "react-bootstrap";
import api from "../api/axios";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, reviewRes] = await Promise.all([
          api.get("/bookings/my-bookings", { headers }),
          api.get("/reviews/my-reviews", { headers })
        ]);

        setBookings(bookingRes.data);
        setReviewedBookings(reviewRes.data.map((review) => String(review.booking)));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setError("");
    setSuccess("");
    setCancellingId(bookingId);

    try {
      await api.patch(`/bookings/${bookingId}/cancel`, {}, { headers });

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      setSuccess("Booking cancelled successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post(
        "/reviews",
        {
          bookingId: reviewingId,
          rating: Number(rating),
          comment
        },
        { headers }
      );

      setReviewedBookings((previous) => [...previous, reviewingId]);
      setReviewingId(null);
      setRating(5);
      setComment("");
      setSuccess("Review submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit review");
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    pending: "warning",
    accepted: "primary",
    rejected: "danger",
    completed: "success",
    cancelled: "secondary"
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">My Bookings</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {!loading && bookings.length === 0 && (
        <Alert variant="info">You haven't made any bookings yet.</Alert>
      )}

      <Row className="g-4">
        {bookings.map((booking) => (
          <Col md={6} key={booking._id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    {booking.service?.name || "Service"}
                  </h5>

                  <Badge bg={statusColors[booking.status] || "secondary"}>
                    {booking.status}
                  </Badge>
                </div>

                <p><strong>Professional:</strong> {booking.worker?.name || "Unknown"}</p>
                <p><strong>Skill:</strong> {booking.worker?.skill || "N/A"}</p>
                <p><strong>Date:</strong> {new Date(booking.serviceDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.serviceTime}</p>
                <p><strong>Address:</strong> {booking.address}</p>

                <h5 className="text-primary fw-bold">₹{booking.totalPrice}</h5>

                {["pending", "accepted"].includes(booking.status) && (
                  <Button
                    variant="outline-danger"
                    disabled={cancellingId === booking._id}
                    onClick={() => handleCancel(booking._id)}
                  >
                    {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                )}

                {booking.status === "completed" && (
                  reviewedBookings.includes(booking._id) ? (
                    <Badge bg="success">⭐ Reviewed</Badge>
                  ) : reviewingId === booking._id ? (
                    <Form onSubmit={handleReview} className="mt-3">
                      <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <Form.Select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ - Excellent</option>
                          <option value={4}>⭐⭐⭐⭐ - Good</option>
                          <option value={3}>⭐⭐⭐ - Average</option>
                          <option value={2}>⭐⭐ - Poor</option>
                          <option value={1}>⭐ - Very Poor</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Your Review</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Share your experience..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button type="submit" disabled={saving}>
                          {saving ? "Submitting..." : "Submit Review"}
                        </Button>

                        <Button
                          variant="outline-secondary"
                          disabled={saving}
                          onClick={() => setReviewingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setReviewingId(booking._id);
                        setRating(5);
                        setComment("");
                      }}
                    >
                      ⭐ Write Review
                    </Button>
                  )
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default MyBookings;