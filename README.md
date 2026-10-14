# Synovus

A modern web project built with **Raw HTML5 / PHP**, **SCSS**, **Bootstrap 5**, and an automated in-memory **PurgeCSS build & watch engine**.

---

## 🛠 Tech Stack

- **HTML5 & Multi-Extension Templates**: Supports `.html`, `.php`, `.xhtml`, `.shtml`, `.cshtml`, `.js`, etc.
- **Bootstrap 5**: Full source components located in `scss/bootstrap/`.
- **SCSS**: Custom overrides & theme tokens in `scss/custom-overrides.scss`.
- **PurgeCSS Engine**: In-memory compilation + tree-shaking via `build.js`, keeping `style.css` lightweight (~70% smaller) even during watch mode.
- **Adobe Typekit Realist Font**: Configured with custom weight mappings (SemiLight 300, Regular 400, Medium 600, Bold 700).

---

## 📁 Project Structure

```text
synovus/
├── scss/
│   ├── bootstrap/            # Complete Bootstrap 5 SCSS source
│   ├── custom-overrides.scss # Custom variable overrides & component styling
│   └── style.scss            # Master SCSS entry point
├── style.css                 # Compiled & purged CSS in the main path
├── assets/
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   └── main.js
│   └── images/
├── index.html                # Main landing page
├── build.js                  # In-memory Sass + PurgeCSS engine (build & watch)
├── package.json              # NPM scripts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the live reactive watcher**:
   ```bash
   npm run dev
   ```
   *Watches `scss/` and all template files (`.html`, `.php`, `.xhtml`, `.shtml`, `.cshtml`, etc.). On every save, it automatically compiles and purges into `style.css` in ~150ms.*

3. **Run a single build**:
   ```bash
   npm run build
   ```

4. **View locally**:
   Open `index.html` in your browser or run through WAMP at `http://localhost/synovus`.
