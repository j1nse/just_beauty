import type { AccentColor } from "../types";

export type CategoryVariant = "portrait" | "landscape" | "game" | "default";

export type ThemePreset = {
  variant: CategoryVariant;
  accent: string;
  edge: string;
  haze: string;
};

function normalize(input: string) {
  return input.trim().toLowerCase();
}

export function getCategoryVariant(category: string): CategoryVariant {
  const value = normalize(category);

  if (
    value.includes("beauty") ||
    value.includes("portrait") ||
    value.includes("girl") ||
    value.includes("美女") ||
    value.includes("人物")
  ) {
    return "portrait";
  }

  if (
    value.includes("land") ||
    value.includes("scenery") ||
    value.includes("nature") ||
    value.includes("风景") ||
    value.includes("景色")
  ) {
    return "landscape";
  }

  if (
    value.includes("game") ||
    value.includes("gaming") ||
    value.includes("游戏")
  ) {
    return "game";
  }

  return "default";
}

export function getThemePreset(category: string, accent?: AccentColor): ThemePreset {
  const variant = getCategoryVariant(category);

  if (variant === "portrait") {
    return {
      variant,
      accent: accent?.hex ?? "#7fe6ff",
      edge: "rgba(255, 180, 228, 0.34)",
      haze: "rgba(104, 174, 255, 0.22)",
    };
  }

  if (variant === "landscape") {
    return {
      variant,
      accent: accent?.hex ?? "#7fe6ff",
      edge: "rgba(153, 224, 255, 0.36)",
      haze: "rgba(95, 138, 255, 0.2)",
    };
  }

  if (variant === "game") {
    return {
      variant,
      accent: accent?.hex ?? "#59f6ff",
      edge: "rgba(89, 246, 255, 0.44)",
      haze: "rgba(40, 132, 255, 0.24)",
    };
  }

  return {
    variant,
    accent: accent?.hex ?? "#78cfff",
    edge: "rgba(132, 219, 255, 0.28)",
    haze: "rgba(91, 131, 255, 0.2)",
  };
}

export function rgbToRgba(color: AccentColor | undefined, alpha: number) {
  if (!color) {
    return `rgba(126, 217, 255, ${alpha})`;
  }

  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}
