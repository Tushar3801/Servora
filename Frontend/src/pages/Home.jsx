import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ServiceCategories from "../components/ServiceCategories";

function Home() {
  return (
    <>
      <section className="py-5 bg-light">
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={7}>
              <h1 className="display-4 fw-bold mb-4">
                Find the Right Professional for Every Job
              </h1>

              <p className="lead text-secondary mb-4">
                From electricians and plumbers to teachers and accountants,
                Servora connects you with skilled professionals you can trust.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <Button as={Link} to="/services" size="lg">
                  Explore Services
                </Button>

                <Button
                  as={Link}
                  to="/register"
                  variant="outline-primary"
                  size="lg"
                >
                  Join as a Professional
                </Button>
              </div>
            </Col>

            <Col lg={5} className="mt-5 mt-lg-0">
              <div className="bg-white rounded-4 shadow-sm p-5 text-center">
                <h2 className="fw-bold text-primary mb-3">
                  Your Work, Our Connection
                </h2>

                <p className="text-secondary mb-0">
                  Discover trusted professionals, book services, and get
                  your work done effortlessly.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <ServiceCategories />
    </>
  );
}

export default Home;