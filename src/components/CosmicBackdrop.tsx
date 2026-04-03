import { useEffect, useRef } from "react";
import { getCategoryVariant, rgbToRgba } from "../lib/theme";
import type { AccentColor } from "../types";

type BackdropProps = {
  accent?: AccentColor;
  category?: string;
  intensity?: "ambient" | "detail";
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  drift: number;
  speed: number;
  depth: number;
};

const PARTICLE_COUNTS = {
  ambient: 64,
  detail: 140,
};

export function CosmicBackdrop({
  accent,
  category = "",
  intensity = "ambient",
  className,
}: BackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const canvasNode = canvas;
    const drawingContext = context;

    const variant = getCategoryVariant(category);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let animationId = 0;
    let particles: Particle[] = [];

    const particleCount = PARTICLE_COUNTS[intensity];

    function resetCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvasNode.width = width * dpr;
      canvasNode.height = height * dpr;
      canvasNode.style.width = `${width}px`;
      canvasNode.style.height = `${height}px`;
      drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.6 + 0.15,
        drift: (Math.random() - 0.5) * 0.35,
        speed: Math.random() * 0.2 + 0.05,
        depth: Math.random() * 0.8 + 0.2,
      }));
    }

    function drawBackground(time: number) {
      const baseColor = rgbToRgba(accent, intensity === "detail" ? 0.18 : 0.1);
      const hazeColor = rgbToRgba(accent, intensity === "detail" ? 0.12 : 0.06);

      drawingContext.clearRect(0, 0, width, height);
      drawingContext.fillStyle = "#040611";
      drawingContext.fillRect(0, 0, width, height);

      const centerGradient = drawingContext.createRadialGradient(
        width * 0.52,
        height * 0.46,
        20,
        width * 0.52,
        height * 0.46,
        Math.max(width, height) * 0.58,
      );
      centerGradient.addColorStop(0, baseColor);
      centerGradient.addColorStop(1, "rgba(4, 6, 17, 0)");
      drawingContext.fillStyle = centerGradient;
      drawingContext.fillRect(0, 0, width, height);

      const deepGradient = drawingContext.createLinearGradient(0, 0, width, height);
      deepGradient.addColorStop(0, "rgba(32, 65, 110, 0.18)");
      deepGradient.addColorStop(0.5, hazeColor);
      deepGradient.addColorStop(1, "rgba(7, 9, 20, 0.05)");
      drawingContext.fillStyle = deepGradient;
      drawingContext.fillRect(0, 0, width, height);

      if (intensity === "detail") {
        const orbitalGradient = drawingContext.createRadialGradient(
          width * 0.82,
          height * 0.22,
          10,
          width * 0.82,
          height * 0.22,
          width * 0.24,
        );
        orbitalGradient.addColorStop(0, "rgba(237, 248, 255, 0.2)");
        orbitalGradient.addColorStop(0.2, rgbToRgba(accent, 0.15));
        orbitalGradient.addColorStop(1, "rgba(4, 6, 17, 0)");
        drawingContext.fillStyle = orbitalGradient;
        drawingContext.fillRect(0, 0, width, height);
      }

      particles.forEach((particle, index) => {
        const variantDrift =
          variant === "portrait"
            ? 0.5
            : variant === "landscape"
              ? 0.28
              : variant === "game"
                ? 0.72
                : 0.4;

        const movement =
          Math.sin(time * 0.00008 * (particle.speed * 10 + 1) + index) *
          particle.depth *
          variantDrift;

        particle.y -= particle.speed * particle.depth;
        particle.x += particle.drift + movement * 0.03;

        if (particle.y < -8) {
          particle.y = height + 8;
          particle.x = Math.random() * width;
        }

        if (particle.x > width + 8) {
          particle.x = -8;
        }

        if (particle.x < -8) {
          particle.x = width + 8;
        }

        drawingContext.beginPath();
        drawingContext.fillStyle =
          index % 9 === 0
            ? rgbToRgba(accent, particle.alpha)
            : `rgba(238, 245, 255, ${particle.alpha})`;
        drawingContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        drawingContext.fill();
      });
    }

    function render(time: number) {
      drawBackground(time);
      animationId = window.requestAnimationFrame(render);
    }

    resetCanvas();
    animationId = window.requestAnimationFrame(render);
    window.addEventListener("resize", resetCanvas);

    return () => {
      window.removeEventListener("resize", resetCanvas);
      window.cancelAnimationFrame(animationId);
    };
  }, [accent, category, intensity]);

  return (
    <canvas
      aria-hidden="true"
      className={className}
      ref={canvasRef}
    />
  );
}
