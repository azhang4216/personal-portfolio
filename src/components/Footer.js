import { Container, Row, Col } from "react-bootstrap";
import logo from "../assets/img/logo.svg";
import linkedinIcon from '../assets/img/linkedin-icon.svg';
import githubIcon from '../assets/img/github-icon.svg';
import emailIcon from '../assets/img/email-icon.svg';
import calendarIcon from '../assets/img/calendar-icon.svg';

export const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center">
          
          <Col size={12} sm={6}>
            <img src={logo} alt="Logo" />
          </Col>
          <Col size={12} sm={6} className="text-center text-sm-end">
            <div className="social-icon">
              <a
                className="linkedin"
                href="https://www.linkedin.com/in/angela-zl-zhang/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={linkedinIcon} alt="LinkedIn" />
              </a>
              <a
                className="github"
                href="https://github.com/azhang4216/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={githubIcon} alt="GitHub" />
              </a>
              <a className="email" href="mailto:angela@pier-finance.com">
                <img src={emailIcon} alt="Email" />
              </a>
              <a
                className="calendly"
                href="https://calendly.com/angela-pier-finance/30min"
                target="_blank"
                rel="noreferrer"
              >
                <img src={calendarIcon} alt="Calendly" />
              </a>
            </div>
            <p>Copyright 2022. All Rights Reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
