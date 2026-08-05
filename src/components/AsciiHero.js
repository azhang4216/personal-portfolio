import { useEffect, useRef } from "react";

const GLYPHS = "01{}[]<>/\\AZ+*=:;";

export function AsciiHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext?.("2d");
    if (!context) return undefined;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    let frame = 0;
    let animationId;
    let width = 0;
    let height = 0;
    let dpr = 1;

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
      const cell = width < 680 ? 13 : 15;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#0d3628";
      context.fillRect(0, 0, width, height);
      context.font = `${Math.max(8, cell * 0.68)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cell + cell / 2;
          const y = row * cell + cell / 2;
          const nx = col / cols;
          const ny = row / rows;
          const wave = Math.sin(col * 0.29 + time * 1.1) + Math.cos(row * 0.24 - time * 0.8);
          const sweep = Math.sin((nx * 1.35 + ny * 0.6) * 8 - time * 1.4);
          const orbX = 0.72 + Math.sin(time * 0.32) * 0.035;
          const orbY = 0.49 + Math.cos(time * 0.25) * 0.025;
          const dx = (nx - orbX) * 1.35;
          const dy = ny - orbY;
          const orb = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 3.3);
          const arcDistance = Math.abs(ny - (0.76 - Math.pow(nx - 0.58, 2) * 1.6));
          const arc = nx > 0.35 && arcDistance < 0.018 ? 1 : 0;
          const noise = Math.sin(col * 91.17 + row * 47.13) * 43758.5453;
          const random = noise - Math.floor(noise);
          const density = 0.08 + Math.max(0, wave + sweep) * 0.07 + orb * 0.72 + arc;

          if (random > density) continue;
          const glyphIndex = Math.abs(Math.floor(noise + time * (2 + (col % 3)))) % GLYPHS.length;
          const alpha = Math.min(0.9, 0.1 + orb * 0.66 + arc * 0.7 + Math.max(0, wave) * 0.08);
          context.fillStyle = arc
            ? `rgba(224, 240, 137, ${alpha})`
            : `rgba(224, 235, 195, ${alpha})`;
          context.fillText(GLYPHS[glyphIndex], x, y);
        }
      }

      context.strokeStyle = "rgba(215, 232, 133, .28)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(width * 0.72, height * 0.49, Math.min(width, height) * 0.22, 0, Math.PI * 2);
      context.stroke();

      frame += 1;
      if (!reducedMotion && frame < Number.MAX_SAFE_INTEGER) animationId = window.requestAnimationFrame(draw);
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
