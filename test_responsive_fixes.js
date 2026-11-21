/**
 * Comprehensive Verification Suite for Responsive Hamburger Menu & Responsive Admin Dashboard
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

let failures = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    passes++;
    console.log(`  [PASS] ${message}`);
  } else {
    failures++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('\n--- 1. Testing Mobile Hamburger Menu Markup across All Public Pages ---');
const publicPages = [
  'index.html',
  'about.html',
  'products.html',
  'services.html',
  'quality.html',
  'market-presence.html',
  'contact.html',
  'batch-verification.html'
];

publicPages.forEach(page => {
  const html = fs.readFileSync(path.join(__dirname, page), 'utf8');
  assert(html.includes('id="mobileToggle"'), `${page}: contains #mobileToggle`);
  assert(html.includes('id="mobileDrawer"'), `${page}: contains #mobileDrawer`);
  assert(html.includes('class="mobile-nav-link"'), `${page}: contains .mobile-nav-link`);
  assert(!html.includes('Partner With Us'), `${page}: "Partner With Us" button is removed`);
});

console.log('\n--- 2. Testing Mobile Hamburger JavaScript Controller (main.js) ---');
const mainJs = fs.readFileSync(path.join(__dirname, 'assets/js/main.js'), 'utf8');
assert(mainJs.includes("mobileToggle.setAttribute('aria-expanded', 'true')"), 'main.js sets aria-expanded true on open');
assert(mainJs.includes("mobileToggle.setAttribute('aria-expanded', 'false')"), 'main.js sets aria-expanded false on close');
assert(mainJs.includes("document.body.style.overflow = 'hidden'"), 'main.js locks body scroll when drawer open');
assert(mainJs.includes("document.body.style.overflow = ''"), 'main.js unlocks body scroll when drawer closed');
assert(mainJs.includes("mobileDrawer.addEventListener('click'"), 'main.js closes drawer when links/buttons clicked');
assert(mainJs.includes("document.addEventListener('click'"), 'main.js closes drawer on outside tap');
assert(mainJs.includes("e.key === 'Escape'"), 'main.js closes drawer on Escape key');
assert(mainJs.includes("window.innerWidth > 860"), 'main.js auto-closes drawer on desktop resize');
assert(mainJs.includes("window.addEventListener('pageshow'"), 'main.js closes drawer on browser navigation / pageshow');

console.log('\n--- 3. Testing CSS Desktop Isolation & Menu Styling (style.css) ---');
const styleCss = fs.readFileSync(path.join(__dirname, 'assets/css/style.css'), 'utf8');
assert(styleCss.includes('@media (min-width: 861px)'), 'style.css has min-width 861px desktop media query');
assert(styleCss.includes('.mobile-drawer {\n    display: none !important;'), 'style.css enforces mobile drawer hidden on desktop');
assert(styleCss.includes('.mobile-toggle {\n    display: none !important;'), 'style.css enforces mobile toggle hidden on desktop');
assert(styleCss.includes('-webkit-overflow-scrolling: touch'), 'style.css enables smooth mobile touch scrolling');

console.log('\n--- 4. Testing Responsive Admin Dashboard HTML (admin.html) ---');
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
assert(adminHtml.includes('class="modal-form-grid-2col"'), 'admin.html has modal-form-grid-2col for responsive modal layout');
assert(adminHtml.includes('data-label="Batch Number"'), 'admin.html has data-label="Batch Number"');
assert(adminHtml.includes('data-label="Product Name"'), 'admin.html has data-label="Product Name"');
assert(adminHtml.includes('data-label="Expiry Date"'), 'admin.html has data-label="Expiry Date"');
assert(adminHtml.includes('data-label="Official Document"'), 'admin.html has data-label="Official Document"');
assert(adminHtml.includes('data-label="Status"'), 'admin.html has data-label="Status"');
assert(adminHtml.includes('data-label="Created Date"'), 'admin.html has data-label="Created Date"');
assert(adminHtml.includes('data-label="Actions"'), 'admin.html has data-label="Actions"');

console.log('\n--- 5. Testing Responsive Admin CSS (batch-verification.css) ---');
const adminCss = fs.readFileSync(path.join(__dirname, 'assets/css/batch-verification.css'), 'utf8');
assert(adminCss.includes('@media (max-width: 768px)'), 'batch-verification.css has max-width: 768px responsive breakpoint');
assert(adminCss.includes('@media (max-width: 430px)'), 'batch-verification.css has max-width: 430px mobile breakpoint');
assert(adminCss.includes('.admin-table thead {\n    display: none;'), 'Admin table hides standard headers on mobile/tablet');
assert(adminCss.includes('content: attr(data-label)'), 'Admin table uses data-label attribute for card field titles');
assert(adminCss.includes('.modal-form-grid-2col {\n    grid-template-columns: 1fr !important;'), 'Modals collapse to single column on mobile');
assert(adminCss.includes('.admin-toolbar-search {\n    width: 100%;\n    min-width: 0;'), 'Admin toolbar search takes 100% width on mobile without overflow');
assert(adminCss.includes('.admin-nav-actions .btn'), 'Admin nav action buttons have responsive styling on mobile');
assert(adminCss.includes('.admin-login-card {\n    padding: 2rem 1.25rem;'), 'Admin login card has mobile-optimized padding for 320px screens');

console.log('\n--- 6. Testing Server Endpoints & Functional API Routes ---');
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const resHome = await makeRequest('GET', '/');
    assert(resHome.statusCode === 200, 'GET / returns 200 OK');

    const resAdmin = await makeRequest('GET', '/admin');
    assert(resAdmin.statusCode === 200, 'GET /admin returns 200 OK');

    const resBatchVerif = await makeRequest('GET', '/batch-verification');
    assert(resBatchVerif.statusCode === 200, 'GET /batch-verification returns 200 OK');

    const resAdminBatches = await makeRequest('GET', '/api/admin/batches');
    assert(resAdminBatches.statusCode === 401, 'GET /api/admin/batches requires auth (returns 401)');

    const postVerify = await makeRequest(
      'POST',
      '/api/verify-batch',
      JSON.stringify({ batch_number: 'VP-2026-B01' }),
      { 'Content-Type': 'application/json' }
    );
    const verifyData = JSON.parse(postVerify.data);
    assert(postVerify.statusCode === 200 && verifyData.success === true, 'POST /api/verify-batch succeeds for valid batch VP-2026-B01');

    console.log(`\n========================================`);
    console.log(`TOTAL PASSES: ${passes}`);
    console.log(`TOTAL FAILURES: ${failures}`);
    console.log(`========================================\n`);

    if (failures > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('API test failed:', err);
    process.exit(1);
  }
})();
