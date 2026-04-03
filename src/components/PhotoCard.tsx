import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { toAssetPath } from "../lib/asset-path";
import { getThemePreset } from "../lib/theme";
import type { PhotoItem } from "../types";

type PhotoCardProps = {
  photo: PhotoItem;
  index: number;
  onOpen: (photo: PhotoItem) => void;
};

export function PhotoCard({ photo, index, onOpen }: PhotoCardProps) {
  const theme = getThemePreset(photo.category, photo.accent);

  return (
    <motion.button
      className="photo-card"
      layoutId={`frame-${photo.id}`}
      onClick={() => onOpen(photo)}
      style={
        {
          "--card-edge": theme.edge,
          "--card-haze": theme.haze,
        } as CSSProperties
      }
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
          delay: Math.min(index * 0.03, 0.28),
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      exit={{ opacity: 0, y: 14, filter: "blur(8px)" }}
    >
      <div className="photo-card__frame">
        <motion.img
          alt={photo.title}
          className="photo-card__image"
          layoutId={`image-${photo.id}`}
          loading="lazy"
          src={toAssetPath(photo.sizes.card.src)}
        />
      </div>
      <div className="photo-card__meta">
        <div>
          <p className="photo-card__eyebrow">{photo.category}</p>
          <h3>{photo.title}</h3>
        </div>
        <span>{new Date(photo.importedAt).toLocaleDateString()}</span>
      </div>
    </motion.button>
  );
}
