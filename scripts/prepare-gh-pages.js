#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const CONTACT_PAGE = 'contact-effective-speech/index.html';
const ICON_PATH = 'wp-content/uploads/2023/03/cropped-44823_Effective_Speech__LLC_SR-01-1.png';
const PHONE_LABEL = '(813) 404-7707';
const PHONE_HREF = 'tel:+18134047707';

const COMMENT_PAGES = new Set([
  'top-8-signs-your-child-might-need-a-language-or-speech-therapy-evaluation/index.html',
  'what-are-the-top-4-learning-styles-in-children/index.html',
]);

const MIRROR_STYLE = `<style id="mirror-static-site">
.mirror-static-cta,.mirror-static-note{margin:20px 0;padding:24px;border:1px solid rgba(12,17,21,0.12);border-radius:18px;background:#f8fafb;box-shadow:0 12px 30px rgba(12,17,21,0.08);}
.mirror-static-cta h3,.mirror-static-note h3{margin:0 0 12px;color:#0c1115;font-size:28px;line-height:1.2;}
.mirror-static-cta p,.mirror-static-note p{margin:0 0 12px;color:#42515a;line-height:1.7;}
.mirror-static-cta p:last-child,.mirror-static-note p:last-child{margin-bottom:0;}
.mirror-static-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;}
.mirror-static-button{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:#0c1115;color:#fff !important;font-weight:700;text-decoration:none !important;}
.mirror-static-button.is-secondary{background:#ffffff;color:#0c1115 !important;border:1px solid rgba(12,17,21,0.16);}
@media (max-width: 767px){
  .mirror-static-cta,.mirror-static-note{padding:20px;}
  .mirror-static-cta h3,.mirror-static-note h3{font-size:24px;}
  .thrv_header .tcb-flex-row,
  .thrv_header .tcb-flex-row.v-2{
    flex-direction:column !important;
    align-items:stretch !important;
  }
  .thrv_header .tcb-flex-row > .tcb-flex-col{
    max-width:100% !important;
    flex:1 1 auto !important;
    padding-left:0 !important;
  }
  .thrv_header .thrv_widget_menu.thrv_wrapper{
    width:100% !important;
    background:rgba(255,255,255,0.92) !important;
    border-radius:18px;
    padding:12px 16px !important;
  }
  .thrv_header .thrv_widget_menu.thrv_wrapper ul.tve_w_menu{
    align-items:center !important;
    text-align:center !important;
  }
  .thrv_header .thrv_widget_menu.thrv_wrapper ul.tve_w_menu > li > a{
    justify-content:center !important;
    color:#0c1115 !important;
    font-weight:600 !important;
    visibility:visible !important;
  }
  .thrv_header .thrv_widget_menu.thrv_wrapper ul.tve_w_menu > li > a span{
    visibility:visible !important;
  }
}
@media (max-width: 1023px){
  .thrv_widget_menu .tve-m-trigger{display:none !important;}
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"] ul.tve_w_menu,
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"].tve-mobile-dropdown ul.tve_w_menu,
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"].tve-mobile-side-right ul.tve_w_menu,
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"].tve-mobile-side-left ul.tve_w_menu,
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"].tve-mobile-side-fullscreen ul.tve_w_menu,
  .thrv_widget_menu[data-tve-switch-icon*="mobile"].tve-mobile-dropdown .tve_w_menu,
  .thrv_widget_menu[data-tve-switch-icon*="tablet"].tve-mobile-dropdown .tve_w_menu{
    display:flex !important;
    position:static !important;
    flex-direction:column !important;
    align-items:flex-start !important;
    gap:8px;
    width:100% !important;
    height:auto !important;
    max-height:none !important;
    opacity:1 !important;
    overflow:visible !important;
    padding:0 !important;
    box-shadow:none !important;
    background:transparent !important;
  }
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"] ul.tve_w_menu > li{
    width:100% !important;
    margin:0 !important;
  }
  .thrv_widget_menu.thrv_wrapper[class*="tve-custom-menu-switch-icon-"] ul.tve_w_menu > li > a{
    padding:8px 0 !important;
  }
}
</style>`;

const GOOGLE_FONT_LINKS = `<link id="mirror-google-fonts" rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Muli:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800&display=swap">`;

const htmlFiles = walkHtmlFiles(ROOT);

for (const fullPath of htmlFiles) {
  const relativePath = toPosix(path.relative(ROOT, fullPath));
  let html = fs.readFileSync(fullPath, 'utf8');
  const original = html;

  html = stripInjectedMirrorArtifacts(html);
  html = stripDynamicScripts(html);
  html = ensureMirrorStyle(html);
  html = ensureExternalFonts(html, relativePath);
  html = normalizeStaticCopy(html);
  html = replaceCompanyName(html);
  html = replaceFooterLinks(html, relativePath);
  html = replaceContactPlaceholders(html);

  if (COMMENT_PAGES.has(relativePath)) {
    html = replaceCommentForm(html, relativePath);
  }

  if (relativePath === CONTACT_PAGE || COMMENT_PAGES.has(relativePath)) {
    html = replaceLeadForm(html, relativePath);
  }

  if (html !== original) {
    fs.writeFileSync(fullPath, html);
  }
}

function walkHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function relLink(fromPage, toRootFile) {
  return path.posix.relative(path.posix.dirname(fromPage), toRootFile) || '.';
}

function stripInjectedMirrorArtifacts(html) {
  return html.replace(/\s*<section class="mirror-post-list"[\s\S]*?<\/section>/g, '');
}

function stripDynamicScripts(html) {
  return html.replace(
    /<script\b(?![^>]*type="application\/ld\+json")[^>]*>[\s\S]*?<\/script>/gi,
    (match) => (match.includes('type="application/ld+json"') ? match : ''),
  );
}

function ensureMirrorStyle(html) {
  if (html.includes('id="mirror-static-site"')) {
    return html.replace(/<style id="mirror-static-site">[\s\S]*?<\/style>/, MIRROR_STYLE);
  }

  return html.replace('</head>', `${MIRROR_STYLE}\n</head>`);
}

function ensureExternalFonts(html, relativePath) {
  const iconHref = relLink(relativePath, ICON_PATH);
  let updated = html
    .replace(/\s*<link[^>]*class="thrive-external-font"[^>]*>\s*/g, '\n')
    .replace(/@import\s+url\([^;]*fonts\.googleapis\.com[^;]*;\s*/g, '');

  if (!updated.includes('id="mirror-favicon"')) {
    updated = updated.replace(
      '</head>',
      `<link id="mirror-favicon" rel="icon" type="image/png" href="${iconHref}">\n</head>`,
    );
  }

  if (updated.includes('id="mirror-google-fonts"')) {
    return updated;
  }

  return updated.replace('</head>', `${GOOGLE_FONT_LINKS}\n</head>`);
}

function replaceCompanyName(html) {
  return html.replace(
    /<span class="thrive-shortcode-content"[^>]*data-shortcode-name="\[Company\] Company Name"[^>]*><\/span>/g,
    'Effective Speech, LLC',
  );
}

function normalizeStaticCopy(html) {
  return html.replace(
    /This static archive keeps the original site content available on GitHub Pages\. For a free consultation, call/g,
    'For a free consultation, call',
  );
}

function replaceFooterLinks(html, relativePath) {
  const contactHref = relLink(relativePath, CONTACT_PAGE);

  return html.replace(
    /<p><span class="thrive-shortcode-content"[^>]*data-shortcode-name="\[Legal\] Disclaimer"[\s\S]*?data-shortcode-name="\[Legal\] Contact"[^>]*><\/span><\/p>/g,
    `<p><a href="${contactHref}">Contact</a></p>`,
  );
}

function replaceContactPlaceholders(html) {
  return html
    .replace(
      /<span class="thrive-shortcode-content"[^>]*data-shortcode-name="\[Company\] Address"[^>]*><\/span>/g,
      'Serving Tampa Bay, Florida',
    )
    .replace(
      /<span class="thrive-shortcode-content"[^>]*data-shortcode-name="\[Company\] Phone number"[^>]*><\/span>/g,
      `<a href="${PHONE_HREF}">${PHONE_LABEL}</a>`,
    )
    .replace(
      /<span class="thrive-shortcode-content"[^>]*data-shortcode-name="\[Company\] Email address"[^>]*><\/span>/g,
      'Free consultations are available by phone.',
    );
}

function replaceCommentForm(html, relativePath) {
  const replacement = buildCommentNote(relativePath);
  const updated = replaceTaggedElement(html, '<form action="https://effectivespeech.org/wp-comments-post.php"', 'form', replacement);

  return updated.replace(
    /<div class="thrive-theme-comments-error-msg"[^>]*>[\s\S]*?<\/div>/,
    '',
  );
}

function replaceLeadForm(html, relativePath) {
  const replacement =
    relativePath === CONTACT_PAGE ? buildContactCta(relativePath) : buildPostCta(relativePath);

  return replaceTaggedElement(
    html,
    '<div class="thrv_wrapper thrv_lead_generation',
    'div',
    replacement,
  );
}

function replaceTaggedElement(html, marker, tagName, replacement) {
  const start = html.indexOf(marker);
  if (start === -1) {
    return html;
  }

  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = start;

  let depth = 0;
  let match;

  while ((match = tagPattern.exec(html))) {
    const token = match[0];
    const isClosing = token.startsWith(`</${tagName}`);
    depth += isClosing ? -1 : 1;

    if (depth === 0) {
      return html.slice(0, start) + replacement + html.slice(tagPattern.lastIndex);
    }
  }

  return html;
}

function buildCommentNote(relativePath) {
  const contactHref = relLink(relativePath, CONTACT_PAGE);

  return `<div class="mirror-static-note">
  <h3>Comments are unavailable in this static archive.</h3>
  <p>If you have questions about evaluations or services, call <a href="${PHONE_HREF}">${PHONE_LABEL}</a> for a free consultation.</p>
  <p><a href="${contactHref}">Visit the contact page</a> for more details.</p>
</div>`;
}

function buildPostCta(relativePath) {
  const contactHref = relLink(relativePath, CONTACT_PAGE);

  return `<div class="mirror-static-cta">
  <h3>Get in touch</h3>
  <p>Effective Speech serves children in the Tampa Bay area and offers free phone consultations.</p>
  <div class="mirror-static-actions">
    <a class="mirror-static-button" href="${PHONE_HREF}">Call ${PHONE_LABEL}</a>
    <a class="mirror-static-button is-secondary" href="${contactHref}">Open contact page</a>
  </div>
</div>`;
}

function buildContactCta(relativePath) {
  const homeHref = relLink(relativePath, 'index.html');

  return `<div class="mirror-static-cta">
  <h3>Contact Effective Speech</h3>
  <p>For a free consultation, call <a href="${PHONE_HREF}">${PHONE_LABEL}</a>.</p>
  <p>Services are available throughout the Tampa Bay area, including Odessa, Trinity, New Port Richey, and Lutz.</p>
  <div class="mirror-static-actions">
    <a class="mirror-static-button" href="${PHONE_HREF}">Call ${PHONE_LABEL}</a>
    <a class="mirror-static-button is-secondary" href="${homeHref}">Back to home</a>
  </div>
</div>`;
}
