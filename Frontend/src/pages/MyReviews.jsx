import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Form
} from "react-bootstrap";
import api from "../api/axios";

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/reviews/my-reviews", { headers });
        setReviews(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const startEditing = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment || "");
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/reviews/${editingId}`,
        { rating: Number(rating), comment },
        { headers }
      );

      setReviews((previous) =>
        previous.map((review) =>
          review._id === editingId
            ? {
                ...review,
                rating: response.data.rating,
                comment: response.data.comment
              }
            : review
        )
      );

      setEditingId(null);
      setSuccess("Review updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingId(reviewId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/reviews/${reviewId}`, { headers });

      setReviews((previous) =>
        previous.filter((review) => review._id !== reviewId)
      );

      if (editingId === reviewId) {
        setEditingId(null);
      }

      setSuccess("Review deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">⭐ My Reviews</h2>

      {loading && <Spinner animation="border" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {success && <Alert variant="success">{success}</Alert>}

      {!loading && reviews.length === 0 && !error && (
        <Alert variant="info">
          You haven't submitted any reviews yet.
        </Alert>
      )}

      <Row className="g-4">
        {reviews.map((review) => (
          <Col md={6} key={review._id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    {review.worker?.name || "Professional"}
                  </h5>

                  <Badge bg="primary">
                    {review.worker?.skill || "Worker"}
                  </Badge>
                </div>

                {editingId === review._id ? (
                  <Form onSubmit={handleUpdate}>
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
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        disabled={saving}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <>
                    <div className="text-warning fs-4 mb-2">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>

                    <p className="text-muted">
                      {review.comment || "No written feedback provided."}
                    </p>

                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        onClick={() => startEditing(review)}
                      >
                        Edit Review
                      </Button>

                      <Button
                        variant="outline-danger"
                        disabled={deletingId === review._id}
                        onClick={() => handleDelete(review._id)}
                      >
                        {deletingId === review._id
                          ? "Deleting..."
                          : "Delete Review"}
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default MyReviews;