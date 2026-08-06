import { Container, Row, Col } from "react-bootstrap";
import headerImg from "../assets/img/banner-angela.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Banner = () => {
  return (
    <section className="banner" id="home">
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} xl={7}>
            <TrackVisibility>
              {({ isVisible }) =>
              <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                <h1 className="mt-auto">Angela Zhang</h1>
                <h2>
                  CTO @{" "}
                  <a
                    className="pier-link"
                    href="https://www.pier-finance.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pier
                  </a>{" "}
                  | Ex-Cohere, AWS, Palantir
                </h2>
                <p>
                  Data ingesting. AI agent-ing. Fullstack engineering. Occasionally golfing.
                </p>
              </div>}
            </TrackVisibility>
          </Col>
          <Col xs={12} md={6} xl={5}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "banner-image-wrap is-visible" : "banner-image-wrap"}>
                  <img src={headerImg} alt="Header Img"/>
                </div>}
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
