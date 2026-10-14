# Synovus

A modern web project built with **Raw HTML**, **SCSS**, and **Bootstrap 5**.

---

## 🛠 Tech Stack

- **HTML5**: Clean, semantic markup.
- **Bootstrap 5**: Responsive layout framework and components.
- **SCSS**: Modular, structured styling and custom theme variables.

---

## 📁 Suggested Project Structure

```text
synovus/
├── assets/
│   ├── css/          # Compiled CSS
│   ├── scss/         # SCSS source files
│   │   ├── _variables.scss
│   │   ├── _custom.scss
│   │   └── main.scss
│   ├── js/           # JavaScript files
│   └── images/       # Static assets and images
├── index.html        # Main landing page
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

1. Clone or navigate to the repository:
   ```bash
   git clone https://github.com/iamfromnepal/synovus.git
   cd synovus
   ```

2. Compile SCSS (using Sass CLI or your preferred SCSS compiler / bundler):
   ```bash
   sass assets/scss/main.scss assets/css/main.css --watch
   ```

3. Open `index.html` in your browser or serve it via your local server (WAMP).
