# Synovus

A modern web project built with **Raw HTML5**, **SCSS**, and **Bootstrap 5**.

---

## 🛠 Tech Stack

- **HTML5**: Clean, semantic markup.
- **Bootstrap 5**: Responsive layout framework and components located in `scss/bootstrap/`.
- **SCSS**: Custom variables and styling overrides via `scss/custom-overrides.scss`, compiling to root `style.css`.

---

## 📁 Project Structure

```text
synovus/
├── scss/
│   ├── bootstrap/            # Bootstrap 5 SCSS source files
│   ├── custom-overrides.scss # Custom variable overrides & component styling
│   └── style.scss            # Master SCSS entry point
├── style.css                 # Compiled CSS in the main path
├── assets/
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   └── main.js
│   └── images/
├── index.html                # Main landing page
├── package.json              # NPM scripts for compilation
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Watch and compile SCSS:
   ```bash
   npm run dev
   ```

3. Build production stylesheet:
   ```bash
   npm run build:css
   ```

4. View locally:
   Open `index.html` directly in your browser or run through WAMP at `http://localhost/synovus`.
