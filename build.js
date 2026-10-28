// ===================================================
// Synovus - High Performance Sass + PurgeCSS Engine
// Supports: .html, .php, .xhtml, .shtml, .cshtml, etc.
// ===================================================

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const { PurgeCSS } = require('purgecss');
const chokidar = require('chokidar');

const SCSS_ENTRY = 'sass/main.scss';
const OUTPUT_CSS = 'wwwroot/assets/css/style.css';

// Content patterns to scan for used CSS classes
const CONTENT_PATTERNS = [
  './**/*.{html,php,xhtml,shtml,cshtml,phtml,inc,tpl,js}',
  '!./node_modules/**',
  '!./vendor/**',
  '!./.git/**',
  '!./dist/**',
  '!./wwwroot/**'
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

const SOURCE_MAP_FILE = `${OUTPUT_CSS}.map`;

/**
 * Compiles SCSS in-memory and purges unused selectors.
 *
 * In debug mode (--sourcemap), PurgeCSS is skipped entirely: it isn't
 * source-map-aware, so running it over mapped CSS would just produce a
 * map that points at the wrong rules. Debug builds trade the smaller,
 * purged output for an accurate style.css.map instead - browser devtools
 * can then show which .scss partial (and line) a rule actually came from.
 */
async function buildCss(withSourceMap) {
  const startTime = Date.now();

  try {
    // 1. Compile SCSS to CSS in-memory
    const sassResult = sass.compile(SCSS_ENTRY, {
      style: withSourceMap ? 'expanded' : 'compressed',
      sourceMap: withSourceMap,
      sourceMapIncludeSources: withSourceMap,
      silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
    });

    const rawSize = Buffer.byteLength(sassResult.css, 'utf8');

    if (withSourceMap) {
      // Skip PurgeCSS (see function comment) - write the mapped CSS as-is.
      const mapName = path.basename(SOURCE_MAP_FILE);
      const css = `${sassResult.css}\n/*# sourceMappingURL=${mapName} */\n`;
      fs.writeFileSync(OUTPUT_CSS, css, 'utf8');
      fs.writeFileSync(SOURCE_MAP_FILE, JSON.stringify(sassResult.sourceMap), 'utf8');

      const duration = Date.now() - startTime;
      const rawKb = (rawSize / 1024).toFixed(1);
      const timeStr = new Date().toLocaleTimeString();
      console.log(`[${timeStr}] style.css (debug, unpurged) updated: ${rawKb} KB + ${mapName} in ${duration}ms - run a normal build before shipping`);
      return;
    }

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
    // A leftover debug map would otherwise still be picked up by the
    // browser (and no longer match this purged, unmapped CSS).
    fs.rmSync(SOURCE_MAP_FILE, { force: true });

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
// Watch mode is for active development - always keep source maps on so
// devtools can show which .scss file (and line) a rule actually came
// from, rather than that being a separate mode you have to remember to
// start instead of the normal watch/dev command. --sourcemap on its own
// (without --watch) still works too, for a single one-off mapped build.
const withSourceMap = isWatch || process.argv.includes('--sourcemap');

if (isWatch) {
  console.log('Starting Synovus Reactive Watcher (Sass + PurgeCSS)...');
  console.log('Scanning templates: .html, .php, .xhtml, .shtml, .cshtml, .js, etc.');
  console.log('Unpurged, expanded CSS + style.css.map while watching, so devtools shows which .scss file a rule came from. Run "npm run build" for the purged version to ship.');

  // Run initial build
  buildCss(withSourceMap);

  // Debounced build runner for watch events
  let debounceTimeout = null;
  const triggerRebuild = (filePath) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      buildCss(withSourceMap);
    }, 60);
  };

  // chokidar 4+ (installed: 5.x) dropped glob-pattern support entirely -
  // passing 'scss/**/*.scss' etc. as watch paths silently matched nothing,
  // so saves never triggered a rebuild; only the unconditional "run once
  // on startup" build above ever fired, which is why killing and
  // restarting this script was the only thing that picked up changes.
  // The documented replacement is to watch a root path and filter with a
  // stats-aware `ignored` function instead of glob strings.
  const IGNORED_DIRS = /[\\/](node_modules|vendor|\.git|\.agents|wwwroot)([\\/]|$)/;
  const WATCHED_EXTENSIONS = /\.(scss|html|php|xhtml|shtml|cshtml|phtml|inc|tpl|js)$/i;

  const watcher = chokidar.watch('.', {
    ignored: (filePath, stats) => {
      if (IGNORED_DIRS.test(filePath)) return true;
      // Called once without stats first (chokidar's own documented
      // pattern) - only the second, stats-aware call can actually tell
      // files apart from directories, so only that call filters by
      // extension; returning false here just lets directories recurse.
      if (stats?.isFile()) return !WATCHED_EXTENSIONS.test(filePath);
      return false;
    },
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
  buildCss(withSourceMap);
}
