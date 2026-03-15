import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

const EXPERIENCE_ITEMS = [
  {
    title: "Chief Technology Officer",
    subtitle: "Pier - Full-time",
    meta: "Jan 2026 - Present - 3 mos",
    location: "San Francisco, California, United States",
    description: "Building data intelligence and AI multi-agent architecture for fintech.",
  },
  {
    title: "Technical Staff",
    subtitle: "Cohere - Full-time",
    meta: "May 2025 - Dec 2025 - 8 mos",
    description: "Data infra team. All things training checkpoint management and tracking.",
  },
  {
    title: "Forward Deployed Engineer",
    subtitle: "Palantir Technologies - Full-time",
    meta: "May 2024 - Aug 2024 - 4 mos",
    location: "London Area, United Kingdom",
    description:
      "Foundry. Supply chain management for a Fortune 500 energy company. Data pipelines and optimization.",
  },
  {
    title: "Software Engineer",
    subtitle: "Amazon Web Services (AWS) - Full-time",
    meta: "Jun 2023 - Aug 2023 - 3 mos",
    location: "Seattle, Washington, United States",
    description: "AWS Lambda.",
  },
  {
    title: "Software Engineer",
    subtitle: "DALI Lab - Part-time",
    meta: "2020 - 2022 - 2 yrs",
    location: "Hanover, New Hampshire, United States",
    description:
      "Youngest member admitted. ML/full-stack and data for a beetle outbreak prediction project, backed by the U.S. Forest Service.",
  },
];

const EDUCATION_ITEMS = [
  {
    title: "Columbia University",
    subtitle: "Bachelor's degree, Computer Science",
    meta: "Grade: 4.15 / 4.0",
    note: "On leave to build something awesome.",
    highlights: [
      "Div 1 golf athlete; WGCA All-American Scholar",
      "Dean's List",
      "Teaching Assistant: Advanced Software Engineering, Data Visualization",
    ],
  },
  {
    title: "Dartmouth College",
    subtitle: "Bachelor's degree, Computer Science & Quantitative Social Science",
    highlights: [
      "Div 1 golf athlete admission at age 16",
      "All-time Women's Golf Program Individual Record Holder",
      "Honor roll all semesters",
      "Teaching Assistant: Software as a Service, Advanced Programming, Algorithms, Data Visualization",
    ],
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getQuadraticPoint = (t, startX, startY, controlX, controlY, endX, endY) => {
  const oneMinusT = 1 - t;
  const x =
    oneMinusT * oneMinusT * startX +
    2 * oneMinusT * t * controlX +
    t * t * endX;
  const y =
    oneMinusT * oneMinusT * startY +
    2 * oneMinusT * t * controlY +
    t * t * endY;
  return { x, y };
};

const WaterHazard = ({ className = "" }) => (
  <div className={`timeline-river ${className}`.trim()} aria-hidden="true">
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
);

const GolferIcon = ({ pose }) => (
  <svg viewBox="0 0 82 82" aria-hidden="true">
    <circle cx="40" cy="12" r="8" />
    <g className={`pose setup ${pose === "setup" ? "visible" : ""}`}>
      <line x1="40" y1="20" x2="40" y2="43" />
      <line x1="40" y1="29" x2="29" y2="36" />
      <line x1="40" y1="29" x2="52" y2="38" />
      <line x1="40" y1="43" x2="31" y2="63" />
      <line x1="40" y1="43" x2="52" y2="63" />
      <polyline className="club" points="55,42 69,58 72,74" />
    </g>
    <g className={`pose finish ${pose === "finish" ? "visible" : ""}`}>
      <line x1="40" y1="20" x2="42" y2="43" />
      <line x1="42" y1="28" x2="30" y2="16" />
      <line x1="42" y1="30" x2="58" y2="20" />
      <polyline className="club" points="58,20 72,10 74,20" />
      <line x1="42" y1="43" x2="34" y2="64" />
      <line x1="42" y1="43" x2="54" y2="61" />
    </g>
  </svg>
);

export const Resume = () => {
  const timelineItems = useMemo(() => {
    const experience = EXPERIENCE_ITEMS.map((item, index) => ({
      ...item,
      id: `experience-${index}`,
      type: "experience",
      sectionStart: index === 0,
    }));

    const education = EDUCATION_ITEMS.map((item, index) => ({
      ...item,
      id: `education-${index}`,
      type: "education",
      sectionStart: index === 0,
    }));

    return [...experience, ...education];
  }, []);

  const timelineRef = useRef(null);
  const cardRefs = useRef([]);
  const teeRefs = useRef([]);
  const holeRefs = useRef([]);
  const rafRef = useRef(null);
  const [segments, setSegments] = useState([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const updateAnimation = useCallback(() => {
    if (!timelineRef.current) {
      return;
    }

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const viewportAnchorY = window.innerHeight * 0.58;

    const nextSegments = timelineItems.slice(0, -1).map((_, index) => {
      const sourceTee = teeRefs.current[index];
      const targetHole = holeRefs.current[index + 1];

      if (!sourceTee || !targetHole) {
        return null;
      }

      const teeRect = sourceTee.getBoundingClientRect();
      const holeRect = targetHole.getBoundingClientRect();

      const startX = teeRect.left + teeRect.width / 2 - timelineRect.left;
      const startY = teeRect.top + teeRect.height / 2 - timelineRect.top;
      const endX = holeRect.left + holeRect.width / 2 - timelineRect.left;
      const endY = holeRect.top + holeRect.height / 2 - timelineRect.top;

      const controlX = (startX + endX) / 2 + (startX < endX ? 85 : -85);
      const verticalDistance = Math.abs(endY - startY);
      const arcLift = clamp(verticalDistance * 0.32, 92, 220);
      const controlY = Math.min(startY, endY) - arcLift;

      const segmentTop = Math.min(teeRect.top + teeRect.height / 2, holeRect.top + holeRect.height / 2);
      const segmentBottom = Math.max(
        teeRect.top + teeRect.height / 2,
        holeRect.top + holeRect.height / 2
      );
      const segmentRange = Math.max(1, segmentBottom - segmentTop);
      const progress = clamp((viewportAnchorY - segmentTop) / segmentRange, 0, 1);
      const ballPoint = getQuadraticPoint(
        progress,
        startX,
        startY,
        controlX,
        controlY,
        endX,
        endY
      );

      return {
        path: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
        progress,
        ballX: ballPoint.x,
        ballY: ballPoint.y,
      };
    });

    setSegments(nextSegments);

    let nextActiveIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    timelineItems.forEach((_, index) => {
      const card = cardRefs.current[index];
      if (!card) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const cardCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(viewportAnchorY - cardCenterY);
      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveIndex = index;
      }
    });

    setActiveItemIndex((prev) => (prev === nextActiveIndex ? prev : nextActiveIndex));
  }, [timelineItems]);

  const requestAnimationUpdate = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(updateAnimation);
  }, [updateAnimation]);

  useEffect(() => {
    requestAnimationUpdate();

    window.addEventListener("scroll", requestAnimationUpdate, { passive: true });
    window.addEventListener("resize", requestAnimationUpdate);

    return () => {
      window.removeEventListener("scroll", requestAnimationUpdate);
      window.removeEventListener("resize", requestAnimationUpdate);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [requestAnimationUpdate]);

  return (
    <section id="resume">
      <div className="resume-content golf-timeline" ref={timelineRef}>
        <div className="golf-overlay" aria-hidden="true">
          <svg preserveAspectRatio="none">
            {segments.map((segment, index) =>
              segment ? <path key={`path-${index}`} className="golf-path" d={segment.path} /> : null
            )}
          </svg>
          {segments.map((segment, index) =>
            segment ? (
              <span
                key={`ball-${index}`}
                className={`golf-ball ${segment.progress > 0.02 && segment.progress < 0.98 ? "active" : ""}`}
                style={{ left: `${segment.ballX}px`, top: `${segment.ballY}px` }}
              />
            ) : null
          )}
        </div>

        <div className="timeline-divider" aria-hidden="true"></div>

        {timelineItems.map((item, index) => {
          const isLeft = index % 2 === 0;
          const isExperience = item.type === "experience";
          const isLastItem = index === timelineItems.length - 1;
          const showHole = true;
          const showGolfer = !isLastItem;
          const sectionTitle = item.sectionStart ? (isExperience ? "Experience" : "Education") : null;
          const sectionId = isExperience ? "experience" : "education";
          const outgoingProgress = segments[index]?.progress ?? 0;
          const shotFired = outgoingProgress > 0.2;
          const pose = shotFired ? "finish" : "setup";

          return (
            <Fragment key={item.id}>
              {sectionTitle ? (
                <>
                  {!isExperience ? (
                    <WaterHazard />
                  ) : null}
                  <h1 className="timeline-section-title" id={sectionId}>
                    {sectionTitle}
                  </h1>
                </>
              ) : null}

              <div
                className={`timeline-row ${isLeft ? "left" : "right"} ${activeItemIndex === index ? "is-active" : ""}`}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
              >
                <article className={`timeline-card ${item.type}`}>
                  <div className="card-header">
                    <span className="item-type">{isExperience ? "Experience" : "Education"}</span>
                    <div className="summary-copy">
                      <h2>{item.title}</h2>
                      <h3>{item.subtitle}</h3>
                    </div>
                  </div>

                  <div className="info-body">
                    {item.meta ? (
                      <p className={isExperience ? "date" : "grade"}>{item.meta}</p>
                    ) : null}
                    {item.location ? <p className="location">{item.location}</p> : null}
                    {item.description ? <p>{item.description}</p> : null}
                    {item.note ? <p>{item.note}</p> : null}
                    {item.highlights ? (
                      <ul>
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {showGolfer ? (
                    <div className={`golfer-figure ${pose}`}>
                      <GolferIcon pose={pose} />
                    </div>
                  ) : null}

                  {showGolfer ? (
                    <span
                      className={`tee-anchor ${shotFired ? "shot-fired" : ""}`}
                      ref={(el) => {
                        teeRefs.current[index] = el;
                      }}
                    >
                      <span className="tee-dot" aria-hidden="true"></span>
                      <span className="tee-pow" aria-hidden="true">
                        💥
                      </span>
                    </span>
                  ) : (
                    <span
                      ref={(el) => {
                        teeRefs.current[index] = el;
                      }}
                      aria-hidden="true"
                      style={{ display: "none" }}
                    />
                  )}

                  {showHole ? (
                    <span
                      className="hole-anchor with-flag"
                      ref={(el) => {
                        holeRefs.current[index] = el;
                      }}
                    >
                      <span className="hole-cup"></span>
                      <span className="flag-pole"></span>
                      <span className="flag-cloth"></span>
                    </span>
                  ) : (
                    <span
                      ref={(el) => {
                        holeRefs.current[index] = el;
                      }}
                      aria-hidden="true"
                      style={{ display: "none" }}
                    />
                  )}
                </article>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
};
