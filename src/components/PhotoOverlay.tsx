import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { toAssetPath } from "../lib/asset-path";
import { getThemePreset } from "../lib/theme";
import type { PhotoItem } from "../types";
import { CosmicBackdrop } from "./CosmicBackdrop";

type PhotoOverlayProps = {
  photo: PhotoItem | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PhotoOverlay({
  photo,
  onClose,
  onNext,
  onPrevious,
}: PhotoOverlayProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [photo?.id]);

  useEffect(() => {
    if (!photo) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        onNext();
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        onPrevious();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNext, onPrevious, photo]);

  useEffect(() => {
    if (!photo) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [photo]);

  if (!photo) {
    return null;
  }

  const theme = getThemePreset(photo.category, photo.accent);

  return (
    <motion.aside
      animate={{ opacity: 1 }}
      className="overlay"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <CosmicBackdrop
        accent={photo.accent}
        category={photo.category}
        className="overlay__backdrop"
        intensity="detail"
      />

      <motion.div
        animate={{ opacity: 1 }}
        className="overlay__veil"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
      />

      <div className="overlay__chrome">
        <div className="overlay__brand">
          <span className="overlay__brand-dot" />
          JUST BEAUTY
        </div>

        <div className="overlay__actions">
          <a
            className="overlay__button overlay__button--download"
            download={`${photo.slug}.avif`}
            href={toAssetPath(photo.sizes.detail.src)}
          >
            Download AVIF
          </a>
          <button
            className="overlay__button"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>

      <div className="overlay__layout">
        <div className="overlay__details">
          <p className="overlay__category">{photo.category}</p>
          <h2>{photo.title}</h2>
          <p className="overlay__hint">
            Use mouse wheel to zoom. Arrow keys navigate the current filter.
          </p>
          {photo.caption ? <p className="overlay__caption">{photo.caption}</p> : null}

          <dl className="overlay__facts">
            <div>
              <dt>Imported</dt>
              <dd>{new Date(photo.importedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{photo.originalName}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{photo.category}</dd>
            </div>
          </dl>

          <div className="overlay__nav">
            <button
              className="overlay__button"
              onClick={onPrevious}
              type="button"
            >
              Previous
            </button>
            <button
              className="overlay__button"
              onClick={onNext}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        <motion.div
          className="overlay__viewer"
          layoutId={`frame-${photo.id}`}
          style={
            {
              "--overlay-edge": theme.edge,
              "--overlay-accent": theme.accent,
            } as CSSProperties
          }
        >
          <div
            className="overlay__viewer-stage"
            onWheel={(event) => {
              event.preventDefault();
              setZoom((value) => clamp(value - event.deltaY * 0.0012, 1, 2.8));
            }}
          >
            <motion.div
              animate={{ scale: zoom }}
              className="overlay__viewer-zoom"
              transition={{ type: "spring", stiffness: 180, damping: 28 }}
            >
              <motion.img
                alt={photo.title}
                className="overlay__image"
                layoutId={`image-${photo.id}`}
                src={toAssetPath(photo.sizes.detail.src)}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
