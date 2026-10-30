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
} from "react-bootstrap";
import api from "../api/axios";

function WorkerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await api.get("/bookings/worker-bookings", {
          headers,
        });

        setBookings(response.data);
      } catch (error) {
        if (error.response?.status === 409) {
          setBookings([]);
        } else {
          setError(error.response?.data?.message || "Unable to load bookings");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const updateStatus = async (bookingId, status) => {
    setError("");
    setSuccess("");
    setUpdatingId(bookingId);

    try {
      if (status === "completed") {
        await api.patch(
          `/bookings/${bookingId}/complete`,
          {},
          { headers }
        );
      } else {
        await api.patch(
          `/bookings/${bookingId}/status`,
          { status },
          { headers }
        );
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );

      setSuccess(`Booking ${status} successfully.`);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors = {
    pending: "warning",
    accepted: "primary",
    rejected: "danger",
    completed: "success",
    cancelled: "secondary",
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-2">Worker Dashboard</h2>
      <p className="text-muted mb-4">
        Manage your bookings and service requests.
      </p>

      {loading && <Spinner animation="border" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {success && <Alert variant="success">{success}</Alert>}

      {!loading && !error && bookings.length === 0 && (
        <Alert variant="info">
          You haven't received any bookings yet.
        </Alert>
      )}

      <Row className="g-4">
        {bookings.map((booking) => (
          <Col md={6} key={booking._id}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="fw-bold">
                    {booking.service?.name || "Service"}
                  </h5>

                  <Badge bg={statusColors[booking.status] || "secondary"}>
                    {booking.status}
                  </Badge>
                </div>

                <p>
                  <strong>Customer:</strong>{" "}
                  {booking.customer?.name || "Customer"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(booking.serviceDate).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong> {booking.serviceTime}
                </p>

                <p>
                  <strong>Address:</strong> {booking.address}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {booking.description || "No description"}
                </p>

                <h5 className="text-primary fw-bold">
                  ₹{booking.totalPrice}
                </h5>

                {booking.status === "pending" && (
                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="success"
                      disabled={updatingId === booking._id}
                      onClick={() => updateStatus(booking._id, "accepted")}
                    >
                      Accept
                    </Button>

                    <Button
                      variant="outline-danger"
                      disabled={updatingId === booking._id}
                      onClick={() => updateStatus(booking._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {booking.status === "accepted" && (
                  <Button
                    variant="primary"
                    className="mt-3"
                    disabled={updatingId === booking._id}
                    onClick={() => updateStatus(booking._id, "completed")}
                  >
                    {updatingId === booking._id
                      ? "Updating..."
                      : "Mark as Completed"}
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

export default WorkerDashboard;