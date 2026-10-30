import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavigationBar() {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
          Servora
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-3">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            <Nav.Link as={Link} to="/services">
              Services
            </Nav.Link>

            {token ? (
              <>
                {role === "customer" && (
                  <>
                    <Nav.Link as={Link} to="/my-bookings">
                      My Bookings
                    </Nav.Link>

                    <Nav.Link as={Link} to="/my-reviews">
                      My Reviews
                    </Nav.Link>

                    <Nav.Link as={Link} to="/customer-profile">
                      My Profile
                    </Nav.Link>
                  </>
                )}

                {role === "worker" && (
                  <>
                    <Nav.Link as={Link} to="/worker-dashboard">
                      Worker Dashboard
                    </Nav.Link>

                    <Nav.Link as={Link} to="/worker-profile">
                      My Profile
                    </Nav.Link>

                    <Nav.Link as={Link} to="/worker-services">
                      My Services
                    </Nav.Link>
                  </>
                )}

                <Button variant="outline-danger" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>

                <Button as={Link} to="/register">
                  Get Started
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;