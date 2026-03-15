import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const PROJECTS = [
  {
    title: "Pine Beetle Predictor",
    club: "Driver",
    kind: "driver",
    description: "Forecasting outbreak risk with predictive modeling and visualization.",
    link: "https://spbpredict.com/",
  },
  {
    title: "A Train Away",
    club: "3 Wood",
    kind: "wood",
    description: "Immersive VR product prototype.",
    link: "https://youtu.be/kVlCGrw6ohk?si=1gxiqFHsR-e0sTEK",
  },
  {
    title: "Sakura Blockchain",
    club: "4 Iron",
    kind: "iron",
    description: "Distributed ledger for environmental state tracking.",
    link: "https://github.com/csee4119-spring-2024/project-link-layer-legends/",
  },
  {
    title: "Food Products Quality Classifier",
    club: "6 Iron",
    kind: "iron",
    description: "NLP pipeline for review-based quality prediction (F1 0.87).",
    link: "https://github.com/azhang4216/cs74_food",
  },
  {
    title: "Simon Says Game",
    club: "8 Iron",
    kind: "iron",
    description: "Frontend game implementation with JavaScript and jQuery.",
    link: "https://github.com/azhang4216/simon-says",
  },
  {
    title: "Lion Study Buddy",
    club: "Wedge",
    kind: "wedge",
    description: "Matching platform for Columbia students to coordinate study sessions.",
    link: "https://youtu.be/7BPPMIxRgN8?si=sP6R16RfB0Cqrwm2",
  },
  {
    title: "Reddit-Twitter API",
    club: "Putter",
    kind: "putter",
    description: "API service integrating Reddit ranking signals and Twitter distribution.",
    link: "https://github.com/azhang4216/reddit-twitter-api",
  },
];

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1700 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 1700, min: 1300 },
    items: 4,
  },
  laptop: {
    breakpoint: { max: 1300, min: 992 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 992, min: 620 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 620, min: 0 },
    items: 1,
  },
};

export const Skills = () => {
  return (
    <section className="skill golf-bag-section" id="projects">
      <div className="projects-river" aria-hidden="true">
        <svg viewBox="0 0 1200 220" preserveAspectRatio="none">
          <path
            className="lake-body"
            d="M 0 84 C 150 70 300 98 450 84 C 600 70 750 98 900 84 C 1050 70 1125 98 1200 84
               L 1200 198
               C 1050 212 900 182 750 198 C 600 212 450 182 300 198 C 150 212 75 182 0 198 Z"
          />
          <path
            className="lake-top"
            d="M 0 84 C 150 70 300 98 450 84 C 600 70 750 98 900 84 C 1050 70 1125 98 1200 84"
          />
          <path
            className="lake-ripple ripple-1"
            d="M 70 126 C 190 116 310 136 430 126 C 550 116 670 136 790 126 C 910 116 1030 136 1150 126"
          />
          <path
            className="lake-ripple ripple-2"
            d="M 120 156 C 235 148 350 164 465 156 C 580 148 695 164 810 156 C 925 148 1040 164 1155 156"
          />
          <path
            className="lake-ripple ripple-3"
            d="M 40 186 C 160 178 280 194 400 186 C 520 178 640 194 760 186 C 880 178 1000 194 1120 186"
          />
        </svg>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="skill-bx golf-bag-bx wow zoomIn">
              <h2>What&apos;s in my bag?</h2>
              <p>Pick a club to open a project. Hover to preview the shot details.</p>
              <Carousel
                responsive={responsive}
                infinite
                keyBoardControl
                containerClass="club-carousel"
                itemClass="club-carousel-item"
                renderDotsOutside={false}
              >
                {PROJECTS.map((project) => (
                  <a
                    key={project.title}
                    className={`club-slot ${project.kind}`}
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.club}: ${project.title}`}
                  >
                    <span className="club-type">{project.club}</span>
                    <span className="club-project">{project.title}</span>
                    <span className="club-illustration" aria-hidden="true">
                      <span className="club-shaft"></span>
                      <span className="club-head"></span>
                      <span className="club-face"></span>
                    </span>
                    <span className="club-tooltip">
                      <strong>{project.title}</strong>
                      <span>{project.description}</span>
                      <em>Open project ↗</em>
                    </span>
                  </a>
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
