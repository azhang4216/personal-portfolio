import { Container, Row, Col } from "react-bootstrap";
import logo from "../assets/img/logo.svg";
import linkedinIcon from '../assets/img/linkedin-icon.svg';
import githubIcon from '../assets/img/github-icon.svg';
import emailIcon from '../assets/img/email-icon.svg';

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
              <a href="https://www.linkedin.com/in/angela-zl-zhang/" target="_blank" rel="noreferrer"><img src={linkedinIcon} alt="" /></a>
              <a href="https://github.com/azhang4216/" target="_blank" rel="noreferrer"><img src={githubIcon} alt="" /></a>
              <a href="mailto:zz2921@columbia.edu"><img src={emailIcon} alt="" /></a>
            </div>
            <p>Copyright 2022. All Rights Reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
