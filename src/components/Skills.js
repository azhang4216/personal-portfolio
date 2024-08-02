import meter1 from "../assets/img/meter1.svg";
import meter2 from "../assets/img/meter2.svg";
import meter3 from "../assets/img/meter3.svg";
import Carousel from 'react-multi-carousel';

import 'react-multi-carousel/lib/styles.css';
import arrow1 from "../assets/img/arrow1.svg";
import arrow2 from "../assets/img/arrow2.svg";
import colorSharp from "../assets/img/color-sharp.png"
import { ProjectCard } from "./ProjectCard";

import spbImg from "../assets/portfolio/01.png";
import trainVrImg from "../assets/portfolio/02.jpg";
import sakuraImg from "../assets/portfolio/03.png";
import classifierImg from "../assets/portfolio/04.jpg";
import simonSaysImg from "../assets/portfolio/05.png";
import tRAPI from "../assets/portfolio/06.png";
import lionStudyBuddyImg from "../assets/portfolio/07.png";

export const Skills = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 4
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const projects = [
    {
      title: "Pine Beetle Predictor",
      description: "Visualizing pine beetle outbreaks with a predictive model",
      imgUrl: spbImg,
      link: "https://spbpredict.com/"
    },
    {
      title: "A Train Away",
      description: "An immersive VR experience",
      imgUrl: trainVrImg,
      link: "https://youtu.be/kVlCGrw6ohk?si=1gxiqFHsR-e0sTEK"
    },
    {
      title: "Sakura Blockchain",
      description: "Recording cherry blossom status on P2P network blockchain",
      imgUrl: sakuraImg,
      link: "https://github.com/csee4119-spring-2024/project-link-layer-legends/"
    },
    {
      title: "Food Products Quality Classifier",
      description: "Predicts quality of Amazon food product based on reviews, F1=0.87",
      imgUrl: classifierImg,
      link: "https://github.com/azhang4216/cs74_food"
    },
    {
      title: "Simon Says Game",
      description: "A game built with JS, jQuery",
      imgUrl: simonSaysImg,
      link: "https://github.com/azhang4216/simon-says"
    },
    {
      title: "Lion Study Buddy",
      description: "A matching service to find study buddies at Columbia",
      imgUrl: lionStudyBuddyImg,
      link: "https://youtu.be/7BPPMIxRgN8?si=sP6R16RfB0Cqrwm2"
    },
    {
      title: "Meme Sharing API",
      description: "An API tool that leverages Reddit's upvote system and Twitter for optimal meme sharing",
      imgUrl: tRAPI,
      link: "https://github.com/azhang4216/reddit-twitter-api"
    }
  ];

  return (
    <section className="skill" id="projects">
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="skill-bx wow zoomIn">
                        <h2>Projects</h2>
                        <p>Check out some of my featured works!</p>
                        <Carousel responsive={responsive} infinite={true} margin="20px" className="owl-carousel owl-theme skill-slider">
                          {
                            projects.map((project, index) => {
                              return (
                                <ProjectCard
                                  key={index}
                                  {...project}
                                  />
                              )
                            })
                          }
                            {/* <div className="item">
                                <img src={meter1} alt="" />
                                <h5>Web Development</h5>
                            </div>
                            <div className="item">
                                <img src={meter2} alt="" />
                                <h5>Brand Identity</h5>
                            </div>
                            <div className="item">
                                <img src={meter3} alt="" />
                                <h5>Logo Design</h5>
                            </div>
                            <div className="item">
                                <img src={meter1} alt="" />
                                <h5>Web Development</h5>
                            </div> */}
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
        <img className="background-image-left" src={colorSharp} alt="Image" />
    </section>
  )
}
