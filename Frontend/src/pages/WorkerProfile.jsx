import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../api/axios";

const emptyForm = {
  name: "",
  skill: "",
  experience: "",
  location: "",
  hourlyRate: "",
  availability: true,
  description: "",
};

function WorkerProfile() {
  const [formData, setFormData] = useState(emptyForm);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/workers/profile", { headers });

        const worker = response.data;

        setFormData({
          name: worker.name || "",
          skill: worker.skill || "",
          experience: worker.experience ?? "",
          location: worker.location || "",
          hourlyRate: worker.hourlyRate ?? "",
          availability: worker.availability ?? true,
          description: worker.description || "",
        });

        setHasProfile(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
        } else {
          setError("Unable to load worker profile");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = {
        ...formData,
        experience: Number(formData.experience),
        hourlyRate: Number(formData.hourlyRate),
      };

      if (hasProfile) {
        await api.put("/workers/profile", data, { headers });
        setSuccess("Profile updated successfully!");
      } else {
        await api.post("/workers", data, { headers });
        setHasProfile(true);
        setSuccess("Worker profile created successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card
        className="border-0 shadow-sm mx-auto"
        style={{ maxWidth: "700px" }}
      >
        <Card.Body className="p-4">
          <h2 className="fw-bold mb-2">
            {hasProfile ? "Edit Professional Profile" : "Create Professional Profile"}
          </h2>

          <p className="text-muted mb-4">
            Manage your professional information on Servora.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Skill</Form.Label>
              <Form.Control
                name="skill"
                placeholder="Electrician, Plumber, Teacher..."
                value={formData.skill}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Experience (Years)</Form.Label>
              <Form.Control
                type="number"
                name="experience"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                name="location"
                placeholder="Enter your city"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hourly Rate (₹)</Form.Label>
              <Form.Control
                type="number"
                name="hourlyRate"
                min="0"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Available for work"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Tell customers about your experience and expertise"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={saving}>
              {saving
                ? "Saving..."
                : hasProfile
                ? "Update Profile"
                : "Create Profile"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default WorkerProfile;