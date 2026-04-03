# JUST BEAUTY

Static cosmic photo showcase built for GitHub Pages.

## Stack

- Vite + React + TypeScript
- Framer Motion for shared transitions and overlay presence
- Sharp for local incremental image processing
- AVIF-only output pipeline for gallery and detail assets

## Base path

The build uses `SITE_BASE` so you can target either:

- `SITE_BASE=/beauty/` for `https://j1nse.github.io/beauty/`
- `SITE_BASE=/just_beauty/` if the GitHub Pages site is served directly from a `just_beauty` repository

For this repository's current GitHub Pages URL, use:

```bash
SITE_BASE=/just_beauty/ npm run build
```

## Local workflow

1. Install dependencies:

   ```bash
   npm install
   ```

2. Put original photos into category folders under `source-images/`:

   ```text
   source-images/
     美女/
     风景/
     游戏/
   ```

3. Process photos:

   ```bash
   npm run images
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Build for GitHub Pages:

   ```bash
   SITE_BASE=/just_beauty/ npm run build
   ```

6. If you want one command that regenerates images and then builds:

   ```bash
   SITE_BASE=/just_beauty/ npm run build:gallery
   ```

## Image pipeline

- Originals stay local in `source-images/`
- Generated assets are written to `public/generated/images`
- Manifest is written to `public/generated/manifest.json`
- Machine registry is stored in `content/photo-registry.json`
- Editable copy metadata is stored in `content/photo-metadata.json`
- New files are detected incrementally by path + file signature
- EXIF metadata is stripped from the generated AVIF files

## GitHub Pages

The repository includes a Pages deployment workflow at `.github/workflows/deploy.yml`.
Set the `SITE_BASE` value in that workflow to match your final Pages path.
The GitHub Actions workflow intentionally does not run `npm run images`, because the original photos are kept out of the repository and only the generated assets are deployed.

GitHub still requires a one-time repository setting:

1. Open `Settings -> Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`

Until that setting is enabled, `actions/configure-pages@v5` can fail with a `Get Pages site failed` or `Not Found` error.

## Editable metadata

After you run `npm run images`, the processor keeps a clean, human-editable file at `content/photo-metadata.json`.
Edit only this file when you want to change display text.

```json
{
  "version": 1,
  "categories": {
    "美女": [
      {
        "source": "美女/example.jpg",
        "title": "Moonlit Portrait",
        "caption": "Optional one-line copy."
      }
    ]
  }
}
```

- `title` is the gallery title shown on the card and in the overlay
- `caption` is optional and can be an empty string
- The file is grouped by category so new imports are easier to find and edit
- `content/photo-registry.json` is generated state and should not be edited by hand
