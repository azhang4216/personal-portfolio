import { useEffect, useRef } from "react";

const GLYPHS = "01{}[]<>/\\AZ+*=:;";
const MODES = ["architect", "customer", "builder", "leader"];
const PALETTES = {
  architect: { background: [13, 54, 40], ink: [224, 235, 195], accent: [217, 232, 142] },
  customer: { background: [12, 53, 56], ink: [178, 231, 219], accent: [244, 146, 105] },
  builder: { background: [15, 43, 65], ink: [187, 220, 241], accent: [93, 207, 224] },
  leader: { background: [42, 36, 59], ink: [231, 218, 194], accent: [235, 190, 101] },
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => 1 - Math.pow(1 - clamp(value), 3);
const mixChannel = (from, to, amount) => Math.round(from + (to - from) * amount);
const mixColor = (from, to, amount) => from.map((channel, index) => mixChannel(channel, to[index], amount));
const rgba = (color, alpha) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
const seeded = (column, row) => {
  const value = Math.sin(column * 91.17 + row * 47.13) * 43758.5453;
  return value - Math.floor(value);
};

function glyphField(context, width, height, cell, time, palette, opacity, sampler) {
  const columns = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  context.font = `${Math.max(8, cell * 0.68)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const nx = column / columns;
      const ny = row / rows;
      const sample = sampler(nx, ny, column, row);
      const random = seeded(column, row);
      const density = clamp(0.025 + sample.intensity * 0.7);
      if (random > density) continue;

      const glyphIndex = Math.abs(Math.floor(random * 1000 + time * (2 + (column % 3)))) % GLYPHS.length;
      const alpha = opacity * clamp(0.07 + sample.intensity * 0.78);
      context.fillStyle = rgba(sample.accent ? palette.accent : palette.ink, alpha);
      context.fillText(GLYPHS[glyphIndex], column * cell + cell / 2, row * cell + cell / 2);
    }
  }
}

function drawArchitect(context, width, height, cell, time, palette, opacity) {
  const orbX = 0.72 + Math.sin(time * 0.32) * 0.035;
  const orbY = 0.49 + Math.cos(time * 0.25) * 0.025;
  glyphField(context, width, height, cell, time, palette, opacity, (nx, ny, column, row) => {
    const dx = (nx - orbX) * 1.35;
    const dy = ny - orbY;
    const orb = 1 - clamp(Math.sqrt(dx * dx + dy * dy) * 3.3);
    const arcDistance = Math.abs(ny - (0.76 - Math.pow(nx - 0.58, 2) * 1.6));
    const arc = nx > 0.35 && arcDistance < 0.02 ? 1 : 0;
    const wave = Math.max(0, Math.sin(column * 0.29 + time * 1.1) + Math.cos(row * 0.24 - time * 0.8));
    return { intensity: 0.05 + orb * 0.85 + arc * 0.9 + wave * 0.04, accent: arc > 0 || orb > 0.68 };
  });

  context.globalAlpha = opacity;
  context.strokeStyle = rgba(palette.accent, 0.32);
  context.lineWidth = 1;
  context.beginPath();
  context.arc(width * orbX, height * orbY, Math.min(width, height) * 0.22, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;
}

function drawCustomer(context, width, height, cell, time, palette, opacity) {
  const pulse = (Math.sin(time * 1.7) + 1) / 2;
  const nodes = [
    [0.57, 0.29], [0.67, 0.43], [0.59, 0.68],
    [0.82, 0.24], [0.9, 0.49], [0.8, 0.72],
  ];
  glyphField(context, width, height, cell, time, palette, opacity, (nx, ny) => {
    const nearest = Math.max(...nodes.map(([x, y]) => 1 - clamp(Math.hypot((nx - x) * 1.25, ny - y) * 8)));
    const bridge = 1 - clamp(Math.abs(ny - (0.46 + Math.sin((nx - 0.55) * 10 + time * 0.45) * 0.1)) * 18);
    return { intensity: nearest * 0.9 + (nx > 0.5 ? bridge * 0.5 : 0), accent: nx > 0.76 || nearest > 0.72 };
  });

  context.globalAlpha = opacity;
  context.lineWidth = 1;
  [[0, 3], [1, 4], [2, 5], [0, 4], [1, 5]].forEach(([from, to], index) => {
    const [x1, y1] = nodes[from];
    const [x2, y2] = nodes[to];
    context.strokeStyle = rgba(index % 2 ? palette.ink : palette.accent, 0.18 + pulse * 0.16);
    context.beginPath();
    context.moveTo(width * x1, height * y1);
    context.bezierCurveTo(width * 0.7, height * (y1 + 0.08), width * 0.76, height * (y2 - 0.08), width * x2, height * y2);
    context.stroke();
  });
  nodes.forEach(([x, y], index) => {
    context.fillStyle = rgba(index > 2 ? palette.accent : palette.ink, 0.72);
    context.beginPath();
    context.arc(width * x, height * y, 2.5 + pulse * 2, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}

function drawBuilder(context, width, height, cell, time, palette, opacity) {
  const panels = [
    [0.51, 0.2, 0.28, 0.2],
    [0.66, 0.39, 0.27, 0.24],
    [0.55, 0.66, 0.31, 0.16],
  ];
  glyphField(context, width, height, cell, time, palette, opacity, (nx, ny, column) => {
    const edge = Math.max(...panels.map(([x, y, w, h]) => {
      const onX = nx >= x && nx <= x + w;
      const onY = ny >= y && ny <= y + h;
      if (!onX || !onY) return 0;
      const distance = Math.min(nx - x, x + w - nx, ny - y, y + h - ny);
      return distance < 0.018 ? 1 : 0.24;
    }));
    const stream = nx > 0.46 && ((column + Math.floor(time * 3)) % 11 === 0) ? 0.42 : 0;
    return { intensity: edge * 0.82 + stream, accent: stream > 0 || (nx > 0.72 && edge > 0.5) };
  });

  context.globalAlpha = opacity;
  panels.forEach(([x, y, panelWidth, panelHeight], index) => {
    const offset = Math.sin(time * 0.55 + index) * 4;
    context.strokeStyle = rgba(index === 1 ? palette.accent : palette.ink, 0.28);
    context.strokeRect(width * x + offset, height * y, width * panelWidth, height * panelHeight);
    context.fillStyle = rgba(index === 1 ? palette.accent : palette.ink, 0.23);
    for (let line = 0; line < 3; line += 1) {
      context.fillRect(width * x + 14 + offset, height * y + 17 + line * 14, width * panelWidth * (0.28 + line * 0.13), 1);
    }
  });
  context.globalAlpha = 1;
}

function drawLeader(context, width, height, cell, time, palette, opacity) {
  const centerX = 0.73;
  const centerY = 0.5;
  glyphField(context, width, height, cell, time, palette, opacity, (nx, ny) => {
    const dx = (nx - centerX) * 1.25;
    const dy = ny - centerY;
    const radius = Math.hypot(dx, dy);
    const rings = 1 - clamp(Math.min(...[0.12, 0.24, 0.36].map((ring) => Math.abs(radius - ring))) * 45);
    const angle = Math.atan2(dy, dx) + time * 0.12;
    const spoke = 1 - clamp(Math.abs(Math.sin(angle * 5)) * 7);
    return { intensity: rings * 0.75 + spoke * (radius < 0.43 ? 0.32 : 0), accent: rings > 0.75 || radius < 0.07 };
  });

  context.globalAlpha = opacity;
  context.strokeStyle = rgba(palette.accent, 0.24);
  context.lineWidth = 1;
  [0.12, 0.24, 0.36].forEach((radius, index) => {
    context.beginPath();
    context.arc(width * centerX, height * centerY, Math.min(width, height) * radius, time * 0.05 * index, Math.PI * (1.35 + index * 0.16));
    context.stroke();
  });
  for (let index = 0; index < 5; index += 1) {
    const angle = time * 0.12 + index * (Math.PI * 2 / 5);
    context.beginPath();
    context.moveTo(width * centerX, height * centerY);
    context.lineTo(width * centerX + Math.cos(angle) * Math.min(width, height) * 0.36, height * centerY + Math.sin(angle) * Math.min(width, height) * 0.36);
    context.stroke();
  }
  context.globalAlpha = 1;
}

const DRAWERS = {
  architect: drawArchitect,
  customer: drawCustomer,
  builder: drawBuilder,
  leader: drawLeader,
};

export function AsciiHero({ mode = "architect" }) {
  const canvasRef = useRef(null);
  const requestedMode = useRef(MODES.includes(mode) ? mode : MODES[0]);

  useEffect(() => {
    requestedMode.current = MODES.includes(mode) ? mode : MODES[0];
  }, [mode]);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext?.("2d");
    if (!context) return undefined;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    let animationId;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let previousMode = requestedMode.current;
    let targetMode = requestedMode.current;
    let transitionStarted = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timestamp = 0) => {
      const time = reducedMotion ? 0 : timestamp / 1000;
      if (requestedMode.current !== targetMode) {
        previousMode = targetMode;
        targetMode = requestedMode.current;
        transitionStarted = timestamp;
      }

      const transition = reducedMotion || previousMode === targetMode
        ? 1
        : ease((timestamp - transitionStarted) / 950);
      const previousPalette = PALETTES[previousMode];
      const targetPalette = PALETTES[targetMode];
      const background = mixColor(previousPalette.background, targetPalette.background, transition);
      const cell = width < 680 ? 13 : 15;

      context.clearRect(0, 0, width, height);
      context.fillStyle = rgba(background, 1);
      context.fillRect(0, 0, width, height);

      if (transition < 1) DRAWERS[previousMode](context, width, height, cell, time, previousPalette, 1 - transition);
      DRAWERS[targetMode](context, width, height, cell, time, targetPalette, transition);

      if (transition >= 1) previousMode = targetMode;
      if (!reducedMotion) animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) window.cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas className="ascii-canvas" ref={canvasRef} aria-hidden="true" />;
}
