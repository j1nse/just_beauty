import { AnimatePresence } from "framer-motion";
import type { PhotoItem } from "../types";
import { PhotoCard } from "./PhotoCard";

type MasonryGalleryProps = {
  items: PhotoItem[];
  onOpen: (photo: PhotoItem) => void;
};

export function MasonryGallery({ items, onOpen }: MasonryGalleryProps) {
  return (
    <div className="gallery-masonry">
      <AnimatePresence mode="popLayout">
        {items.map((photo, index) => (
          <PhotoCard
            index={index}
            key={photo.id}
            onOpen={onOpen}
            photo={photo}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
