// ===================================================
// Synovus - High Performance Sass + PurgeCSS Engine
// Supports: .html, .php, .xhtml, .shtml, .cshtml, etc.
// ===================================================

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const { PurgeCSS } = require('purgecss');
const chokidar = require('chokidar');

const SCSS_ENTRY = 'scss/style.scss';
const OUTPUT_CSS = 'style.css';

// Content patterns to scan for used CSS classes
const CONTENT_PATTERNS = [
  './**/*.{html,php,xhtml,shtml,cshtml,phtml,inc,tpl,js}',
  '!./node_modules/**',
  '!./vendor/**',
  '!./.git/**',
  '!./dist/**'
];

// Bootstrap runtime & dynamic class protections
const SAFELIST = {
  standard: [
    /show$/,
    /collapsing$/,
    /fade$/,
    /active$/,
    /disabled$/,
    /^modal-/,
    /^offcanvas-/,
    /^tooltip/,
    /^popover/,
    /^dropdown-menu/,
    /^bs-/,
    /^was-validated/
  ],
  deep: [
    /^tooltip/,
    /^popover/,
    /^modal-backdrop/
  ],
  greedy: [
    /^dropdown-menu/,
    /^collaps/
  ]
};

// Universal regex extractor for matching class tokens across any language/markup
const defaultExtractor = content => content.match(/[\w-/:]+(?<!:)/g) || [];

/**
 * Compiles SCSS in-memory and purges unused selectors
 */
async function buildCss() {
  const startTime = Date.now();

  try {
    // 1. Compile SCSS to CSS in-memory
    const sassResult = sass.compile(SCSS_ENTRY, {
      style: 'compressed',
      silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
    });

    const rawSize = Buffer.byteLength(sassResult.css, 'utf8');

    // 2. Run PurgeCSS in-memory against template files
    const purgeResult = await new PurgeCSS().purge({
      content: CONTENT_PATTERNS,
      css: [{ raw: sassResult.css }],
      safelist: SAFELIST,
      defaultExtractor
    });

    const purgedCss = purgeResult[0]?.css || sassResult.css;
    const finalSize = Buffer.byteLength(purgedCss, 'utf8');

    // 3. Write output to style.css
    fs.writeFileSync(OUTPUT_CSS, purgedCss, 'utf8');

    const duration = Date.now() - startTime;
    const rawKb = (rawSize / 1024).toFixed(1);
    const finalKb = (finalSize / 1024).toFixed(1);
    const reduction = Math.round((1 - finalSize / rawSize) * 100);

    const timeStr = new Date().toLocaleTimeString();
    console.log(`[${timeStr}] style.css updated: ${rawKb} KB -> ${finalKb} KB (-${reduction}%) in ${duration}ms`);
  } catch (err) {
    console.error(`[Build Error]`, err.message || err);
  }
}

// ---------------------------------------------------
// CLI Execution: Single Build vs. Watch Mode
// ---------------------------------------------------

const isWatch = process.argv.includes('--watch');

if (isWatch) {
  console.log('Starting Synovus Reactive Watcher (Sass + PurgeCSS)...');
  console.log('Scanning templates: .html, .php, .xhtml, .shtml, .cshtml, .js, etc.');

  // Run initial build
  buildCss();

  // Debounced build runner for watch events
  let debounceTimeout = null;
  const triggerRebuild = (filePath) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      buildCss();
    }, 60);
  };

  const watcher = chokidar.watch([
    'scss/**/*.scss',
    '**/*.{html,php,xhtml,shtml,cshtml,phtml,inc,tpl,js}'
  ], {
    ignored: [
      '**/node_modules/**',
      '**/vendor/**',
      '**/.git/**',
      OUTPUT_CSS
    ],
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 10
    }
  });

  watcher
    .on('add', filePath => triggerRebuild(filePath))
    .on('change', filePath => triggerRebuild(filePath))
    .on('unlink', filePath => triggerRebuild(filePath));

  console.log('Watching for changes... (Press Ctrl+C to stop)\n');
} else {
  // Single build
  buildCss();
}
