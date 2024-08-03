import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export const Resume = () => {
    const control1 = useAnimation();
    const control2 = useAnimation();
    const control3 = useAnimation();
    const control4 = useAnimation();
    const control5 = useAnimation();
    const control6 = useAnimation();
    const control7 = useAnimation();
    const control8 = useAnimation();

    // need one to keep track of each "info" item sliding in + the 2 titles
    const [refEduTitle, inViewEduTitle] = useInView();
    const [refEdu1, inViewEdu1] = useInView();
    const [refEdu2, inViewEdu2] = useInView();
    const [refWorkTitle, inViewWorkTitle] = useInView();
    const [refWork1, inViewWork1] = useInView();
    const [refWork2, inViewWork2] = useInView();
    const [refWork3, inViewWork3] = useInView();
    const [refWork4, inViewWork4] = useInView();

    // updating each item's visibility based on where we are
    const useInViewEffect = (ref, inView, control) => {
      useEffect(() => {
        if (inView) {
          control.start("visible");
        } else {
          control.start("hidden");
        }
      }, [ref, inView, control]);
    };

    useInViewEffect(refEduTitle, inViewEduTitle, control1);
    useInViewEffect(refEdu1, inViewEdu1, control2);
    useInViewEffect(refEdu2, inViewEdu2, control3);
    useInViewEffect(refWorkTitle, inViewWorkTitle, control4);
    useInViewEffect(refWork1, inViewWork1, control5);
    useInViewEffect(refWork2, inViewWork2, control6);
    useInViewEffect(refWork3, inViewWork3, control7);
    useInViewEffect(refWork4, inViewWork4, control8);

    const educationItems = [
        {
          "school":"B.A. in CS @ Columbia University (Transfer), '25",
          "description":"• 4.16/4.00 GPA, Dean's List\n• Recruited Division I Athlete",
          "ref": refEdu1,
          "control": control2
        },
        {
          "school":"B.A. in CS & QSS @ Dartmouth College, '19-'21",
          "description":"• 3.79/4.00 GPA, Honors Roll Recipient\n• All-Time School Program Record Holder for Women’s Golf",
          "ref": refEdu2,
          "control": control3
        }
    ];

    const workItems = [
        {
          "company":"Teaching Assistant, COMS 4156 Advanced Software Engineering @ Columbia University",
          "years":"May 2024 - Present",
          "description":"• Grading assignments, leading office hours, and providing academic support to students",
          "ref": refWork1,
          "control": control5
        },
        {
          "company":"Forward Deployed Engineer Intern @ Palantir",
          "years":"May 2022 - August 2022",
          "description":"• Engaged closely with business clients to understand their needs and create appropriate technical solutions\n• Built an app with 1 other engineer in 14 days to mitigate emergency supply shortage for an energy company\n• Designed a system to identify redundancies and nondeterministic states in Palantir’s data pipelines",
          "ref": refWork2,
          "control": control6
        },
        {
          "company":"Software Engineer Dev I Intern @ Amazon Web Services",
          "years":"June 2021 - September 2021",
          "description":"• Promoted to a college junior level internship despite having applied for a sophomore position\n• Designed, coded, and tested an asynchronous code artifact layer merging system for serverless functions",
          "ref": refWork3,
          "control": control7
        },
        {
          "company":"Fullstack Engineer @ DALI Lab",
          "years":"August 2020 - June 2021",
          "description":"• Admitted as one of the youngest members to Dartmouth's selective tech-entrepreneurial incubator\n• Worked part-time to create Agile lifecycle apps for companies in SCRUM team compositions",
          "ref": refWork4,
          "control": control8
        }
    ];

    // different sliding in animations
    const rightToLeftvariant = {
      hidden: {
        x: "100%",
        y: 0,
        opacity: 0
      },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: "tween",
          delay: 1.25, // starts after left to right variant is completed
          duration: 1.5,
          ease: "easeOut",
        },
      },
    }

    const leftToRightVariant = {
      hidden: {
        x: "-100%",
        y: 0,
        opacity: 0
      },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: "tween",
          delay: 0.2,
          duration: 1,
          ease: "easeOut",
        },
      },
    }
    

    const education = educationItems.map((item) => {
        return (
          <div className="info">
            <motion.div
              ref={item.ref}
              variants={rightToLeftvariant}
              initial="hidden"
              animate={item.control}
              className="info"
            >
              <h2>{item.school}</h2>
              <h4>{item.description}</h4>
            </motion.div>
          </div>
        )
    });

    const work = workItems.map((item) => {
        return (
          <div className="info">
            <motion.div
              ref={item.ref}
              variants={rightToLeftvariant}
              initial="hidden"
              animate={item.control}
              className="info"
            >
              <h2>{item.company}</h2>
              <h4 className="info">
                <em className="date">{item.years}</em>
                <br />
                {item.description}
              </h4>
            </motion.div>
          </div>
        )
    });

    // downloading PDF resume
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = 'AZ Resume.pdf';
      link.download = 'AZ Resume.pdf';
      link.click();
    };

    return (
      <section id="resume">
        {/* <div className="resume-header">
          <h1>Resume</h1>
          <button className="btn btn-primary" onClick={handleDownload}>
            Download it as a PDF!
          </button>
        </div> */}
        <div className="row education">
          <motion.div
            ref={refEduTitle}
            variants={leftToRightVariant}
            initial="hidden"
            animate={control1}
            className="row-child"
          >
            <h1>Education</h1>
          </motion.div>
          <div className="row-child">{education}</div>
        </div>
        <hr />
        <div className="row work-exp">
          <motion.div
            ref={refWorkTitle}
            variants={leftToRightVariant}
            initial="hidden"
            animate={control4}
            className="row-child"
          >
            <h1>Work Experience</h1>
          </motion.div>
          <div className="row-child">{work}</div>
        </div>
      </section>
    );
}