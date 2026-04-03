import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { CosmicBackdrop } from "./components/CosmicBackdrop";
import { MasonryGallery } from "./components/MasonryGallery";
import { PhotoOverlay } from "./components/PhotoOverlay";
import { toAssetPath } from "./lib/asset-path";
import { getThemePreset } from "./lib/theme";
import type { GalleryManifest, PhotoItem } from "./types";

function syncQuery(category: string, activePhotoId: string | null) {
  const params = new URLSearchParams(window.location.search);

  if (category === "all") {
    params.delete("category");
  } else {
    params.set("category", category);
  }

  if (activePhotoId) {
    params.set("photo", activePhotoId);
  } else {
    params.delete("photo");
  }

  const next = params.toString();
  const nextUrl = next ? `${window.location.pathname}?${next}` : window.location.pathname;
  window.history.replaceState(null, "", nextUrl);
}

function createEmptyManifest(): GalleryManifest {
  return {
    generatedAt: "",
    count: 0,
    items: [],
  };
}

export default function App() {
  const [manifest, setManifest] = useState<GalleryManifest>(createEmptyManifest);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") ?? "all";
  });
  const [activePhotoId, setActivePhotoId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("photo");
  });

  useEffect(() => {
    let isMounted = true;

    async function loadManifest() {
      try {
        const response = await fetch(toAssetPath("generated/manifest.json"), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Manifest request failed with ${response.status}`);
        }

        const data = (await response.json()) as GalleryManifest;

        if (!isMounted) {
          return;
        }

        setManifest(data);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unknown manifest error");
        setManifest(createEmptyManifest());
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadManifest();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    syncQuery(category, activePhotoId);
  }, [activePhotoId, category]);

  useEffect(() => {
    if (!manifest.items.length) {
      return;
    }

    if (!activePhotoId) {
      return;
    }

    const exists = manifest.items.some((item) => item.id === activePhotoId);

    if (!exists) {
      setActivePhotoId(null);
    }
  }, [activePhotoId, manifest.items]);

  const categories = Array.from(new Set(manifest.items.map((item) => item.category)));
  const visibleItems =
    category === "all"
      ? manifest.items
      : manifest.items.filter((item) => item.category === category);
  const activePhoto =
    visibleItems.find((item) => item.id === activePhotoId) ??
    manifest.items.find((item) => item.id === activePhotoId) ??
    null;
  const heroItems = visibleItems.slice(0, 3);
  const theme = getThemePreset(activePhoto?.category ?? category, activePhoto?.accent);
  const activeIndex = visibleItems.findIndex((item) => item.id === activePhoto?.id);

  function openPhoto(photo: PhotoItem) {
    setActivePhotoId(photo.id);
  }

  function stepPhoto(direction: number) {
    if (!visibleItems.length || !activePhoto) {
      return;
    }

    const currentIndex =
      activeIndex >= 0
        ? activeIndex
        : visibleItems.findIndex((item) => item.id === activePhoto.id);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    setActivePhotoId(visibleItems[nextIndex].id);
  }

  return (
    <div
      className="app-shell"
      style={
        {
          "--theme-accent": theme.accent,
          "--theme-edge": theme.edge,
          "--theme-haze": theme.haze,
        } as CSSProperties
      }
    >
      <CosmicBackdrop
        accent={activePhoto?.accent}
        category={activePhoto?.category ?? category}
        className="page-backdrop"
      />

      <div className="page-glow page-glow--left" />
      <div className="page-glow page-glow--right" />

      <header className="hero">
        <div className="hero__topline">
          <div className="hero__brand">
            <span className="hero__brand-dot" />
            JUST BEAUTY
          </div>
          <span className="hero__path">/beauty/ static cosmic archive</span>
        </div>

        <div className="hero__layout">
          <div className="hero__copy">
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="hero__eyebrow"
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              人像、风景与游戏世界，在轨道中缓缓展开
            </motion.p>
            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            >
              JUST BEAUTY
            </motion.h1>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="hero__lede"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
            >
              一个为大量压缩 AVIF 图片浏览而设计的深空画廊。
              先快速陈列，再通过共享放大转场进入电影感十足的全屏沉浸查看。
            </motion.p>
          </div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="hero__orbit"
            initial={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
          >
            <div className="hero__orbit-core" />
            {heroItems.length ? (
              heroItems.map((item, index) => (
                <motion.img
                  alt={item.title}
                  animate={{ y: [0, -12 - index * 4, 0] }}
                  className={`hero__orbit-card hero__orbit-card--${index + 1}`}
                  key={item.id}
                  src={toAssetPath(item.sizes.card.src)}
                  transition={{
                    duration: 8 + index * 1.5,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              ))
            ) : (
              <>
                <div className="hero__ghost hero__ghost--1" />
                <div className="hero__ghost hero__ghost--2" />
                <div className="hero__ghost hero__ghost--3" />
              </>
            )}
          </motion.div>
        </div>
      </header>

      <section className="toolbar">
        <div className="toolbar__summary">
          <p className="toolbar__label">Archive</p>
          <h2>{manifest.count} processed frames</h2>
          <p className="toolbar__copy">
            The grid stays lighter for flow. The heavy space treatment activates in the
            immersive overlay.
          </p>
        </div>

        <div className="toolbar__filters">
          <button
            className={category === "all" ? "filter-pill is-active" : "filter-pill"}
            onClick={() => {
              setCategory("all");
              setActivePhotoId(null);
            }}
            type="button"
          >
            All
          </button>
          {categories.map((itemCategory) => (
            <button
              className={category === itemCategory ? "filter-pill is-active" : "filter-pill"}
              key={itemCategory}
              onClick={() => {
                setCategory(itemCategory);
                setActivePhotoId(null);
              }}
              type="button"
            >
              {itemCategory}
            </button>
          ))}
        </div>
      </section>

      <main className="gallery-shell">
        {loading ? (
          <section className="empty-state">
            <h2>Loading manifest…</h2>
            <p>Preparing the current photo index and cosmic layout.</p>
          </section>
        ) : error ? (
          <section className="empty-state">
            <h2>Manifest unavailable</h2>
            <p>{error}</p>
          </section>
        ) : visibleItems.length ? (
          <MasonryGallery
            items={visibleItems}
            onOpen={openPhoto}
          />
        ) : (
          <section className="empty-state">
            <h2>Drop photos into `source-images/` and run `npm run images`</h2>
            <p>
              Add category folders such as `美女`, `风景`, or `游戏`. The processor will create
              AVIF outputs, extract accent colors, and update the static manifest.
            </p>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>
          Built for GitHub Pages at <strong>https://j1nse.github.io/beauty</strong>
        </span>
        <span>
          {manifest.generatedAt
            ? `Last generated ${new Date(manifest.generatedAt).toLocaleString()}`
            : "No generated assets yet"}
        </span>
      </footer>

      <AnimatePresence>
        {activePhoto ? (
          <PhotoOverlay
            onClose={() => setActivePhotoId(null)}
            onNext={() => stepPhoto(1)}
            onPrevious={() => stepPhoto(-1)}
            photo={activePhoto}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
