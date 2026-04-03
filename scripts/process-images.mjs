import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "source-images");
const OUTPUT_DIR = path.join(ROOT, "public", "generated", "images");
const MANIFEST_FILE = path.join(ROOT, "public", "generated", "manifest.json");
const REGISTRY_FILE = path.join(ROOT, "content", "photo-registry.json");

const CARD_WIDTH = 760;
const DETAIL_WIDTH = 2280;
const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".tif",
  ".tiff",
]);

function posixPath(input) {
  return input.split(path.sep).join("/");
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function titleize(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureDir(input) {
  await fs.mkdir(input, { recursive: true });
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function collectImageFiles(directory, category = null) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nextCategory = category ?? entry.name;
      files.push(...(await collectImageFiles(absolutePath, nextCategory)));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.has(extension) || !category) {
      continue;
    }

    const stat = await fs.stat(absolutePath);
    const relativePath = posixPath(path.relative(SOURCE_DIR, absolutePath));
    files.push({
      absolutePath,
      relativePath,
      category,
      originalName: entry.name,
      signature: `${stat.size}-${Math.round(stat.mtimeMs)}`,
    });
  }

  return files;
}

async function averageAccent(inputPath) {
  const { data, info } = await sharp(inputPath)
    .rotate()
    .resize(16, 16, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let red = 0;
  let green = 0;
  let blue = 0;

  for (let index = 0; index < data.length; index += info.channels) {
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
  }

  const pixels = data.length / info.channels || 1;
  const r = Math.round(red / pixels);
  const g = Math.round(green / pixels);
  const b = Math.round(blue / pixels);

  return {
    r,
    g,
    b,
    hex: `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")}`,
  };
}

async function processVariant(sourcePath, targetPath, width, quality) {
  await ensureDir(path.dirname(targetPath));
  await sharp(sourcePath)
    .rotate()
    .resize({
      width,
      fit: "inside",
      withoutEnlargement: true,
    })
    .avif({
      quality,
      effort: 6,
    })
    .toFile(targetPath);

  const metadata = await sharp(targetPath).metadata();
  const stat = await fs.stat(targetPath);

  return {
    src: posixPath(path.relative(path.join(ROOT, "public"), targetPath)),
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    bytes: stat.size,
  };
}

async function main() {
  await ensureDir(SOURCE_DIR);
  await ensureDir(OUTPUT_DIR);

  const registry = await readJson(REGISTRY_FILE, {
    version: 1,
    items: {},
  });

  const sourceFiles = await collectImageFiles(SOURCE_DIR);
  const nextRegistry = {
    version: 1,
    items: {},
  };
  const manifestItems = [];

  for (const sourceFile of sourceFiles) {
    const existing = registry.items[sourceFile.relativePath];
    const baseName = titleize(sourceFile.originalName);
    const uniqueSuffix = createHash("sha1")
      .update(sourceFile.relativePath)
      .digest("hex")
      .slice(0, 8);
    const categorySlug = slugify(sourceFile.category) || "category";
    const titleSlug = slugify(baseName) || "photo";
    const id = existing?.id ?? `${categorySlug}-${titleSlug}-${uniqueSuffix}`;
    const outputBase = path.join(OUTPUT_DIR, id);
    const cardOutput = path.join(outputBase, "card.avif");
    const detailOutput = path.join(outputBase, "detail.avif");
    const needsProcessing =
      existing?.signature !== sourceFile.signature ||
      !(await fileExists(cardOutput)) ||
      !(await fileExists(detailOutput));

    const accent = needsProcessing
      ? await averageAccent(sourceFile.absolutePath)
      : existing.accent;

    const card = needsProcessing
      ? await processVariant(sourceFile.absolutePath, cardOutput, CARD_WIDTH, 58)
      : await describeGeneratedAsset(cardOutput);
    const detail = needsProcessing
      ? await processVariant(sourceFile.absolutePath, detailOutput, DETAIL_WIDTH, 64)
      : await describeGeneratedAsset(detailOutput);

    const entry = {
      id,
      slug: existing?.slug ?? `${titleSlug}-${uniqueSuffix}`,
      title: existing?.title ?? baseName,
      category: sourceFile.category,
      caption: existing?.caption ?? null,
      originalName: sourceFile.originalName,
      importedAt: existing?.importedAt ?? new Date().toISOString(),
      signature: sourceFile.signature,
      accent,
      sizes: {
        card,
        detail,
      },
    };

    nextRegistry.items[sourceFile.relativePath] = entry;
    manifestItems.push(entry);
  }

  manifestItems.sort((left, right) => right.importedAt.localeCompare(left.importedAt));

  await writeJson(REGISTRY_FILE, nextRegistry);
  await writeJson(MANIFEST_FILE, {
    generatedAt: new Date().toISOString(),
    count: manifestItems.length,
    items: manifestItems,
  });

  console.log(`Processed ${manifestItems.length} photo(s).`);
}

async function describeGeneratedAsset(filePath) {
  const metadata = await sharp(filePath).metadata();
  const stat = await fs.stat(filePath);

  return {
    src: posixPath(path.relative(path.join(ROOT, "public"), filePath)),
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    bytes: stat.size,
  };
}

async function fileExists(input) {
  try {
    await fs.access(input);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
