import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import api from "../api/axios";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  basePrice: "",
  duration: ""
};

function WorkerServices() {
  const [myServices, setMyServices] = useState([]);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  };

  const fetchServices = async () => {
    try {
      const response = await api.get("/workers/profile", { headers });
      setMyServices(response.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingId(null);
  };

  const handleEdit = (service) => {
    setEditingId(service._id);

    setFormData({
      name: service.name || "",
      category: service.category || "",
      description: service.description || "",
      basePrice: service.basePrice ?? "",
      duration: service.duration ?? ""
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const data = {
      ...formData,
      basePrice: Number(formData.basePrice),
      duration: Number(formData.duration)
    };

    try {
      if (editingId) {
        await api.put(`/workers/services/${editingId}`, data, { headers });
        setSuccess("Service updated successfully!");
      } else {
        await api.post("/workers/create-service", data, { headers });
        setSuccess("Service created successfully!");
      }

      resetForm();
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (serviceId) => {
    setError("");
    setSuccess("");
    setActionId(serviceId);

    try {
      const response = await api.patch(
        `/workers/services/${serviceId}/toggle`,
        {},
        { headers }
      );

      setMyServices((previous) =>
        previous.map((service) =>
          service._id === serviceId ? response.data.service : service
        )
      );

      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change service status");
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (serviceId) => {
    if (!window.confirm("Are you sure you want to remove this service?")) {
      return;
    }

    setError("");
    setSuccess("");
    setActionId(serviceId);

    try {
      await api.delete(`/workers/services/${serviceId}`, { headers });

      setMyServices((previous) =>
        previous.filter((service) => service._id !== serviceId)
      );

      if (editingId === serviceId) {
        resetForm();
      }

      setSuccess("Service removed successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove service");
    } finally {
      setActionId(null);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-2">Manage My Services</h2>

      <p className="text-muted mb-4">
        Create, edit, and manage the services you offer to customers.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-4">
            {editingId ? "Edit Service" : "Create New Service"}
          </h4>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                name="name"
                placeholder="e.g. Fan Installation"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                name="category"
                placeholder="e.g. Electrical, Plumbing, Teaching"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Describe the service you provide"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="basePrice"
                placeholder="e.g. 500"
                value={formData.basePrice}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Duration (Minutes)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="duration"
                placeholder="e.g. 60"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" disabled={saving} className="flex-grow-1">
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Service"
                  : "Create Service"}
              </Button>

              {editingId && (
                <Button
                  variant="outline-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="fw-bold mb-3">My Services</h4>

      {loading ? (
        <Spinner animation="border" />
      ) : myServices.length === 0 ? (
        <Alert variant="info">
          You haven't created any services yet.
        </Alert>
      ) : (
        <div className="row g-3">
          {myServices.map((service) => (
            <div className="col-md-6" key={service._id}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold">{service.name}</h5>
                    <Badge bg={service.isActive ? "success" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <Badge bg="primary" className="mb-3">
                    {service.category}
                  </Badge>

                  <p className="text-muted">
                    {service.description || "No description provided"}
                  </p>

                  <p>
                    <strong>Duration:</strong> {service.duration} minutes
                  </p>

                  <h5 className="text-success fw-bold">
                    ₹{service.basePrice}
                  </h5>

                  <div className="d-flex gap-2 flex-wrap mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      disabled={actionId === service._id}
                    >
                      Edit
                    </Button>

                    <Button
                      variant={service.isActive ? "outline-warning" : "outline-success"}
                      size="sm"
                      onClick={() => handleToggle(service._id)}
                      disabled={actionId === service._id}
                    >
                      {service.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemove(service._id)}
                      disabled={actionId === service._id}
                    >
                      Remove
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default WorkerServices;