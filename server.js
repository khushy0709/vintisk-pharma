const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// Render and persistent storage path configuration
const PERSISTENT_DATA_DIR = process.env.PERSISTENT_DATA_DIR || process.env.PERSISTENT_DIR || process.env.DATA_DIR || null;

const DATA_DIR = PERSISTENT_DATA_DIR
  ? path.resolve(PERSISTENT_DATA_DIR, 'data')
  : path.join(ROOT_DIR, 'data');

const STORAGE_DIR = process.env.STORAGE_DIR || (PERSISTENT_DATA_DIR
  ? path.resolve(PERSISTENT_DATA_DIR, 'storage', 'batch_documents')
  : path.join(ROOT_DIR, 'storage', 'batch_documents'));

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'vintisk_pharma.db');

const DEFAULT_DATA_DIR = path.join(ROOT_DIR, 'data');
const DEFAULT_STORAGE_DIR = path.join(ROOT_DIR, 'storage', 'batch_documents');
const DEFAULT_DB_PATH = path.join(DEFAULT_DATA_DIR, 'vintisk_pharma.db');

// Ensure data and storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Auto-seed persistent storage from repo seeds on first deployment
if (PERSISTENT_DATA_DIR && !fs.existsSync(DB_PATH) && fs.existsSync(DEFAULT_DB_PATH)) {
  try {
    fs.copyFileSync(DEFAULT_DB_PATH, DB_PATH);
    console.log(`[Vintisk Storage] Initialized persistent database at: ${DB_PATH}`);
  } catch (e) {
    console.warn(`[Vintisk Storage] Warning: Could not copy initial database:`, e.message);
  }
}

if (PERSISTENT_DATA_DIR && fs.existsSync(DEFAULT_STORAGE_DIR)) {
  try {
    const initialDocs = fs.readdirSync(DEFAULT_STORAGE_DIR);
    for (const doc of initialDocs) {
      const dest = path.join(STORAGE_DIR, doc);
      if (!fs.existsSync(dest)) {
        try {
          fs.copyFileSync(path.join(DEFAULT_STORAGE_DIR, doc), dest);
        } catch (e) {}
      }
    }
  } catch (e) {}
}

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Setup database tables
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
    pdf_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT,
    file_size INTEGER DEFAULT 0,
    product_name TEXT,
    expiry_date TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );
`);

// Password hashing helpers
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password, salt, storedHash) {
  const hash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// Ensure admin user exists with secure credentials
const adminCountStmt = db.prepare('SELECT COUNT(*) as count FROM admins');
const adminCount = adminCountStmt.get().count;

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : null;

if (adminCount === 0) {
  if (isProduction && !ADMIN_PASSWORD) {
    console.error('====================================================================');
    console.error('FATAL: In production mode, ADMIN_PASSWORD environment variable is required.');
    console.error('Please configure ADMIN_PASSWORD in your Render environment variables.');
    console.error('====================================================================');
    process.exit(1);
  }

  const initialPassword = ADMIN_PASSWORD || 'Admin@Vintisk2026!';
  if (!ADMIN_PASSWORD) {
    console.warn('[Vintisk Security Warning] No ADMIN_PASSWORD provided. Using default non-production password.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(initialPassword, salt);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO admins (username, password_hash, salt, created_at)
    VALUES (?, ?, ?, ?)
  `).run(ADMIN_USERNAME, hash, salt, now);
  console.log(`[Vintisk Security] Admin user initialized: ${ADMIN_USERNAME}`);
} else if (ADMIN_PASSWORD && process.env.UPDATE_ADMIN_PASSWORD === 'true') {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(ADMIN_PASSWORD, salt);
  db.prepare(`
    UPDATE admins SET password_hash = ?, salt = ? WHERE username = ? COLLATE NOCASE
  `).run(hash, salt, ADMIN_USERNAME);
  console.log(`[Vintisk Security] Admin password updated from environment variable for: ${ADMIN_USERNAME}`);
}

// PDF Path Resolver (handles persistent storage, relative paths, and prevents directory traversal)
function resolvePdfPath(storedPath) {
  if (!storedPath) return null;

  // 1. Direct absolute path if it exists
  if (path.isAbsolute(storedPath) && fs.existsSync(storedPath)) {
    return storedPath;
  }

  // 2. Basename inside configured STORAGE_DIR
  const baseName = path.basename(storedPath);
  const inStorage = path.join(STORAGE_DIR, baseName);
  if (fs.existsSync(inStorage)) {
    return inStorage;
  }

  // 3. Basename inside default repo storage
  const inDefaultStorage = path.join(DEFAULT_STORAGE_DIR, baseName);
  if (fs.existsSync(inDefaultStorage)) {
    return inDefaultStorage;
  }

  // 4. Relative to ROOT_DIR
  const fromRoot = path.join(ROOT_DIR, storedPath);
  if (fs.existsSync(fromRoot)) {
    return fromRoot;
  }

  return inStorage;
}

function isPathSafe(filePath) {
  if (!filePath) return false;
  const resolved = path.resolve(filePath);
  const allowedStorage = path.resolve(STORAGE_DIR);
  const allowedDefaultStorage = path.resolve(DEFAULT_STORAGE_DIR);
  const allowedRoot = path.resolve(ROOT_DIR);
  return resolved.startsWith(allowedStorage) || resolved.startsWith(allowedDefaultStorage) || resolved.startsWith(allowedRoot);
}

// Multer storage setup for PDF uploads (stored outside public root in STORAGE_DIR)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeBase = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    cb(null, `batch_${timestamp}_${randomHex}_${safeBase}.pdf`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' || (file.mimetype && file.mimetype !== 'application/pdf')) {
      return cb(new Error('INVALID_PDF_TYPE'));
    }
    cb(null, true);
  }
});

// App configuration & Security headers
app.disable('x-powered-by');
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Body parsing and cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// CORS configuration (Permissive for local dev, restricted in production)
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : null;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!isProduction) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (allowedOrigins && origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Block access to sensitive files, secrets, database, test scripts, and storage folders
app.use((req, res, next) => {
  // Normalize with forward slashes for cross-platform consistency (Windows and Linux)
  const reqPath = path.normalize(req.path).replace(/\\/g, '/').toLowerCase();
  
  // Block hidden files/folders (e.g., .env, .git)
  if (reqPath.split('/').some(part => part.startsWith('.'))) {
    return res.status(403).json({ error: 'Access forbidden' });
  }

  // Block source code, db files, test scripts, and storage direct access
  if (
    (reqPath.endsWith('.js') && !reqPath.startsWith('/assets/')) ||
    reqPath.endsWith('.json') ||
    reqPath.endsWith('.db') ||
    reqPath.endsWith('.sqlite') ||
    reqPath.endsWith('.log') ||
    reqPath.endsWith('.md') ||
    reqPath.endsWith('.yaml') ||
    reqPath.endsWith('.yml') ||
    reqPath.startsWith('/data') ||
    reqPath.startsWith('/storage') ||
    reqPath.includes('..')
  ) {
    return res.status(403).json({ error: 'Access forbidden' });
  }
  next();
});

// Login Rate Limiter (Brute-force protection)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry) return true;
  if (now - entry.firstAttempt > LOGIN_LOCKOUT_MS) {
    loginAttempts.delete(ip);
    return true;
  }
  return entry.count < MAX_LOGIN_ATTEMPTS;
}

function recordFailedLogin(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAttempt > LOGIN_LOCKOUT_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

function resetLoginRateLimit(ip) {
  loginAttempts.delete(ip);
}

// Clean up expired sessions periodically
setInterval(() => {
  try {
    db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(Date.now());
  } catch (e) {}
}, 60 * 60 * 1000).unref();

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
  const token = req.cookies.admin_session || req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
  }

  const sessionStmt = db.prepare(`
    SELECT s.token, s.admin_id, s.expires_at, a.username 
    FROM admin_sessions s
    JOIN admins a ON a.id = s.admin_id
    WHERE s.token = ?
  `);
  const session = sessionStmt.get(token);

  if (!session) {
    res.clearCookie('admin_session', { path: '/' });
    return res.status(401).json({ error: 'unauthorized', message: 'Session invalid or expired' });
  }

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    res.clearCookie('admin_session', { path: '/' });
    return res.status(401).json({ error: 'unauthorized', message: 'Session expired' });
  }

  req.admin = { id: session.admin_id, username: session.username };
  next();
}

// ----------------------------------------------------
// HEALTH CHECK (for Render health monitoring)
// ----------------------------------------------------
app.get('/healthz', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// ----------------------------------------------------
// PUBLIC API: Verify Batch
// ----------------------------------------------------
app.post('/api/verify-batch', (req, res) => {
  try {
    const rawBatchNumber = req.body.batch_number;

    // Handle empty batch number
    if (!rawBatchNumber || typeof rawBatchNumber !== 'string' || !rawBatchNumber.trim()) {
      return res.status(400).json({
        success: false,
        error: 'empty_batch',
        message: 'Please enter a batch number to verify.'
      });
    }

    const batchNumber = rawBatchNumber.trim();
    if (batchNumber.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'invalid_batch',
        message: 'Batch number exceeds maximum allowed length.'
      });
    }

    // Query database for batch record (case-insensitive lookup)
    const stmt = db.prepare(`
      SELECT id, batch_number, pdf_url, storage_path, original_filename, 
             product_name, expiry_date, status, created_at, updated_at
      FROM batches
      WHERE batch_number = ? COLLATE NOCASE
    `);
    const batch = stmt.get(batchNumber);

    // Handle batch not found
    if (!batch) {
      return res.status(200).json({
        success: false,
        error: 'not_found',
        heading: 'Batch Not Found',
        message: 'We could not find a document associated with this batch number. Please check the batch number and try again. If the issue persists, please contact Vintisk Pharma.'
      });
    }

    // Handle inactive batch
    if (batch.status.toLowerCase() !== 'active') {
      return res.status(200).json({
        success: false,
        error: 'inactive',
        heading: 'Batch Record Inactive',
        message: 'This batch record is currently marked as inactive in our verification system. Please contact Vintisk Pharma for verification support.',
        batch_number: batch.batch_number
      });
    }

    // Check if the underlying PDF file exists in storage
    const absolutePdfPath = resolvePdfPath(batch.storage_path);
    if (!absolutePdfPath || !fs.existsSync(absolutePdfPath) || !isPathSafe(absolutePdfPath)) {
      return res.status(200).json({
        success: false,
        error: 'missing_pdf',
        heading: 'Document Archival Notice',
        message: 'The official batch document is registered in the system but currently undergoing archival maintenance. Please contact Vintisk Pharma.',
        batch_number: batch.batch_number
      });
    }

    // Check expiry status
    let isExpired = false;
    if (batch.expiry_date) {
      const expDate = new Date(batch.expiry_date);
      if (!isNaN(expDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) {
          isExpired = true;
        }
      }
    }

    // Return verified response
    return res.status(200).json({
      success: true,
      heading: '✓ Batch Verified',
      message: 'This batch number is registered in the Vintisk Pharma verification system.',
      batch: {
        id: batch.id,
        batch_number: batch.batch_number,
        product_name: batch.product_name || null,
        expiry_date: batch.expiry_date || null,
        status: batch.status,
        created_at: batch.created_at,
        is_expired: isExpired
      },
      document_url: `/api/documents/batch/${encodeURIComponent(batch.batch_number)}`,
      filename: batch.original_filename || `Batch_${batch.batch_number}_Document.pdf`
    });

  } catch (err) {
    console.error('Batch verification error:', err);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      heading: 'Verification Service Unavailable',
      message: 'Unable to complete verification at this time due to a server error. Please try again shortly or contact Vintisk Pharma.'
    });
  }
});

// ----------------------------------------------------
// PUBLIC DOCUMENT STREAM: Return only PDF for active verified batch
// ----------------------------------------------------
app.get('/api/documents/batch/:batchNumber', (req, res) => {
  try {
    const rawBatchNumber = req.params.batchNumber;
    if (!rawBatchNumber || !rawBatchNumber.trim()) {
      return res.status(400).send('Invalid batch number');
    }

    const batchNumber = rawBatchNumber.trim();
    const batch = db.prepare(`
      SELECT id, batch_number, storage_path, original_filename, status
      FROM batches
      WHERE batch_number = ? COLLATE NOCASE
    `).get(batchNumber);

    if (!batch) {
      return res.status(404).send('Document not found for this batch');
    }

    // Check if requester has admin session; if not, enforce active status
    let isAdmin = false;
    const token = req.cookies.admin_session || req.headers['x-admin-token'];
    if (token) {
      const session = db.prepare('SELECT admin_id, expires_at FROM admin_sessions WHERE token = ?').get(token);
      if (session && Date.now() <= session.expires_at) {
        isAdmin = true;
      }
    }

    if (!isAdmin && batch.status.toLowerCase() !== 'active') {
      return res.status(403).send('Document is currently not available for inactive batches');
    }

    const absolutePdfPath = resolvePdfPath(batch.storage_path);
    if (!absolutePdfPath || !fs.existsSync(absolutePdfPath) || !isPathSafe(absolutePdfPath)) {
      return res.status(404).send('Document file not found on storage server');
    }

    const safeFilename = `Vintisk_Batch_${batch.batch_number}_Document.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');

    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Security-Policy', "frame-ancestors * 'self' file: blob: data:");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-transform, max-age=1800');

    const stream = fs.createReadStream(absolutePdfPath);
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('Error reading document');
      }
    });
    stream.pipe(res);

  } catch (err) {
    console.error('Document stream error:', err);
    res.status(500).send('Internal server error');
  }
});

// ----------------------------------------------------
// ADMIN AUTH API
// ----------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!checkLoginRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'too_many_attempts',
        message: 'Too many failed login attempts. Please try again after 15 minutes.'
      });
    }

    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'missing_credentials', message: 'Username and password are required' });
    }

    if (username.length > 100 || password.length > 256) {
      recordFailedLogin(clientIp);
      return res.status(400).json({ error: 'invalid_credentials', message: 'Credentials exceed allowed length' });
    }

    const admin = db.prepare('SELECT id, username, password_hash, salt FROM admins WHERE username = ? COLLATE NOCASE').get(username.trim());
    if (!admin || !verifyPassword(password, admin.salt, admin.password_hash)) {
      recordFailedLogin(clientIp);
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid username or password' });
    }

    resetLoginRateLimit(clientIp);

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_sessions (token, admin_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, admin.id, expiresAt, now);

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      success: true,
      token,
      user: { username: admin.username }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'server_error', message: 'Login failed due to a server error' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies.admin_session || req.headers['x-admin-token'];
  if (token) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  }
  res.clearCookie('admin_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/'
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  return res.status(200).json({
    authenticated: true,
    user: { id: req.admin.id, username: req.admin.username }
  });
});

app.post('/api/admin/change-password', authenticateAdmin, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'missing_fields', message: 'Current and new password are required' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'weak_password', message: 'New password must be at least 8 characters long' });
    }

    const admin = db.prepare('SELECT id, password_hash, salt FROM admins WHERE id = ?').get(req.admin.id);
    if (!admin || !verifyPassword(current_password, admin.salt, admin.password_hash)) {
      return res.status(400).json({ error: 'wrong_password', message: 'Current password is incorrect' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(new_password, newSalt);

    db.prepare('UPDATE admins SET password_hash = ?, salt = ? WHERE id = ?').run(newHash, newSalt, req.admin.id);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to update password' });
  }
});

// ----------------------------------------------------
// ADMIN BATCH MANAGEMENT API
// ----------------------------------------------------

// List all batches with optional search and status filter
app.get('/api/admin/batches', authenticateAdmin, (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    const statusFilter = req.query.status ? req.query.status.trim().toLowerCase() : '';

    let sql = 'SELECT * FROM batches WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (batch_number LIKE ? OR product_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (statusFilter && (statusFilter === 'active' || statusFilter === 'inactive')) {
      sql += ' AND status = ?';
      params.push(statusFilter);
    }

    sql += ' ORDER BY id DESC';

    const batches = db.prepare(sql).all(...params);

    // Compute stats
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM batches').get().count;
    const activeCount = db.prepare("SELECT COUNT(*) as count FROM batches WHERE status = 'active'").get().count;
    const inactiveCount = db.prepare("SELECT COUNT(*) as count FROM batches WHERE status = 'inactive'").get().count;

    return res.status(200).json({
      success: true,
      batches,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount
      }
    });

  } catch (err) {
    console.error('Admin get batches error:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to fetch batches' });
  }
});

// Add new batch + PDF upload
app.post('/api/admin/batches', authenticateAdmin, (req, res) => {
  upload.single('pdf_file')(req, res, (err) => {
    if (err) {
      if (err.message === 'INVALID_PDF_TYPE') {
        return res.status(400).json({ error: 'invalid_pdf', message: 'Only valid PDF files (.pdf) are allowed.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'file_too_large', message: 'PDF file size must not exceed 25MB.' });
      }
      return res.status(400).json({ error: 'upload_error', message: 'File upload failed: ' + err.message });
    }

    const tempFile = req.file;

    try {
      const rawBatchNumber = req.body.batch_number;
      const productName = req.body.product_name ? req.body.product_name.trim() : null;
      const expiryDate = req.body.expiry_date ? req.body.expiry_date.trim() : null;
      const status = (req.body.status && req.body.status.trim().toLowerCase() === 'inactive') ? 'inactive' : 'active';

      if (!rawBatchNumber || !rawBatchNumber.trim()) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(400).json({ error: 'missing_batch_number', message: 'Batch number is required.' });
      }

      const batchNumber = rawBatchNumber.trim();
      if (batchNumber.length > 100) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(400).json({ error: 'invalid_batch', message: 'Batch number exceeds allowed length.' });
      }

      if (!tempFile) {
        return res.status(400).json({ error: 'missing_pdf', message: 'A PDF document is required for this batch.' });
      }

      // Check PDF magic bytes (%PDF-)
      const buffer = Buffer.alloc(5);
      const fd = fs.openSync(tempFile.path, 'r');
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);

      if (buffer.toString('utf8') !== '%PDF-') {
        fs.unlinkSync(tempFile.path);
        return res.status(400).json({ error: 'invalid_pdf_content', message: 'Uploaded file is not a valid PDF document.' });
      }

      // Check for duplicate batch number
      const existing = db.prepare('SELECT id FROM batches WHERE batch_number = ? COLLATE NOCASE').get(batchNumber);
      if (existing) {
        fs.unlinkSync(tempFile.path);
        return res.status(409).json({
          error: 'duplicate_batch',
          message: `Batch Number "${batchNumber}" already exists in the system. Batch numbers must be unique.`
        });
      }

      const storagePath = path.join('storage', 'batch_documents', path.basename(tempFile.path)).replace(/\\/g, '/');
      const pdfUrl = `/api/documents/batch/${encodeURIComponent(batchNumber)}`;
      const now = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO batches (
          batch_number, pdf_url, storage_path, original_filename, 
          file_size, product_name, expiry_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertStmt.run(
        batchNumber,
        pdfUrl,
        storagePath,
        tempFile.originalname,
        tempFile.size,
        productName,
        expiryDate,
        status,
        now,
        now
      );

      const newBatch = db.prepare('SELECT * FROM batches WHERE id = ?').get(result.lastInsertRowid);

      return res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        batch: newBatch
      });

    } catch (dbErr) {
      if (tempFile && fs.existsSync(tempFile.path)) {
        try { fs.unlinkSync(tempFile.path); } catch (e) {}
      }
      console.error('Batch create error:', dbErr);
      return res.status(500).json({ error: 'database_error', message: 'Failed to create batch: ' + dbErr.message });
    }
  });
});

// Edit existing batch (with optional replacement PDF)
app.put('/api/admin/batches/:id', authenticateAdmin, (req, res) => {
  upload.single('pdf_file')(req, res, (err) => {
    if (err) {
      if (err.message === 'INVALID_PDF_TYPE') {
        return res.status(400).json({ error: 'invalid_pdf', message: 'Only valid PDF files (.pdf) are allowed.' });
      }
      return res.status(400).json({ error: 'upload_error', message: 'File upload failed: ' + err.message });
    }

    const tempFile = req.file;

    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(400).json({ error: 'invalid_id', message: 'Invalid batch ID' });
      }

      const existingBatch = db.prepare('SELECT * FROM batches WHERE id = ?').get(id);
      if (!existingBatch) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(404).json({ error: 'not_found', message: 'Batch not found' });
      }

      const rawBatchNumber = req.body.batch_number;
      const productName = req.body.product_name !== undefined ? (req.body.product_name ? req.body.product_name.trim() : null) : existingBatch.product_name;
      const expiryDate = req.body.expiry_date !== undefined ? (req.body.expiry_date ? req.body.expiry_date.trim() : null) : existingBatch.expiry_date;
      const status = req.body.status !== undefined ? (req.body.status.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active') : existingBatch.status;

      if (!rawBatchNumber || !rawBatchNumber.trim()) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(400).json({ error: 'missing_batch_number', message: 'Batch number is required.' });
      }

      const batchNumber = rawBatchNumber.trim();
      if (batchNumber.length > 100) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(400).json({ error: 'invalid_batch', message: 'Batch number exceeds allowed length.' });
      }

      // Check unique constraint against other batches
      const duplicate = db.prepare('SELECT id FROM batches WHERE batch_number = ? COLLATE NOCASE AND id != ?').get(batchNumber, id);
      if (duplicate) {
        if (tempFile && fs.existsSync(tempFile.path)) fs.unlinkSync(tempFile.path);
        return res.status(409).json({
          error: 'duplicate_batch',
          message: `Batch Number "${batchNumber}" already belongs to another batch record.`
        });
      }

      let storagePath = existingBatch.storage_path;
      let originalFilename = existingBatch.original_filename;
      let fileSize = existingBatch.file_size;

      if (tempFile) {
        // Validate PDF magic bytes
        const buffer = Buffer.alloc(5);
        const fd = fs.openSync(tempFile.path, 'r');
        fs.readSync(fd, buffer, 0, 5, 0);
        fs.closeSync(fd);

        if (buffer.toString('utf8') !== '%PDF-') {
          fs.unlinkSync(tempFile.path);
          return res.status(400).json({ error: 'invalid_pdf_content', message: 'Uploaded file is not a valid PDF document.' });
        }

        // Delete old PDF file if different
        const oldFileAbs = resolvePdfPath(existingBatch.storage_path);
        if (oldFileAbs && fs.existsSync(oldFileAbs) && isPathSafe(oldFileAbs)) {
          try { fs.unlinkSync(oldFileAbs); } catch (e) { console.warn('Could not delete old PDF:', e); }
        }

        storagePath = path.join('storage', 'batch_documents', path.basename(tempFile.path)).replace(/\\/g, '/');
        originalFilename = tempFile.originalname;
        fileSize = tempFile.size;
      }

      const pdfUrl = `/api/documents/batch/${encodeURIComponent(batchNumber)}`;
      const now = new Date().toISOString();

      db.prepare(`
        UPDATE batches SET
          batch_number = ?,
          pdf_url = ?,
          storage_path = ?,
          original_filename = ?,
          file_size = ?,
          product_name = ?,
          expiry_date = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        batchNumber,
        pdfUrl,
        storagePath,
        originalFilename,
        fileSize,
        productName,
        expiryDate,
        status,
        now,
        id
      );

      const updatedBatch = db.prepare('SELECT * FROM batches WHERE id = ?').get(id);

      return res.status(200).json({
        success: true,
        message: 'Batch updated successfully',
        batch: updatedBatch
      });

    } catch (err) {
      if (tempFile && fs.existsSync(tempFile.path)) {
        try { fs.unlinkSync(tempFile.path); } catch (e) {}
      }
      console.error('Batch update error:', err);
      return res.status(500).json({ error: 'database_error', message: 'Failed to update batch: ' + err.message });
    }
  });
});

// Toggle status active/inactive
app.patch('/api/admin/batches/:id/status', authenticateAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (isNaN(id) || !status || (status !== 'active' && status !== 'inactive')) {
      return res.status(400).json({ error: 'invalid_status', message: "Status must be either 'active' or 'inactive'." });
    }

    const batch = db.prepare('SELECT id FROM batches WHERE id = ?').get(id);
    if (!batch) {
      return res.status(404).json({ error: 'not_found', message: 'Batch not found' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE batches SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    return res.status(200).json({ success: true, message: `Batch status changed to ${status}`, status });
  } catch (err) {
    console.error('Status update error:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to update status' });
  }
});

// Delete batch and delete PDF from storage
app.delete('/api/admin/batches/:id', authenticateAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'invalid_id', message: 'Invalid batch ID' });
    }

    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(id);
    if (!batch) {
      return res.status(404).json({ error: 'not_found', message: 'Batch not found' });
    }

    // Remove PDF file from storage
    const absolutePdfPath = resolvePdfPath(batch.storage_path);
    if (absolutePdfPath && fs.existsSync(absolutePdfPath) && isPathSafe(absolutePdfPath)) {
      try {
        fs.unlinkSync(absolutePdfPath);
      } catch (e) {
        console.warn('Failed to delete PDF file on disk:', e);
      }
    }

    db.prepare('DELETE FROM batches WHERE id = ?').run(id);

    return res.status(200).json({ success: true, message: 'Batch and associated document deleted successfully' });
  } catch (err) {
    console.error('Delete batch error:', err);
    return res.status(500).json({ error: 'server_error', message: 'Failed to delete batch' });
  }
});

// ----------------------------------------------------
// STRICT PUBLIC STATIC ASSETS SERVING
// ----------------------------------------------------

// Serve public CSS, JS, Images from /assets
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets'), {
  maxAge: isProduction ? '1d' : 0
}));

// Whitelist of valid public HTML pages
const PUBLIC_HTML_PAGES = new Set([
  'index.html',
  'about.html',
  'products.html',
  'services.html',
  'quality.html',
  'market-presence.html',
  'contact.html',
  'batch-verification.html',
  'admin.html'
]);

// Serve home page
app.get('/', (req, res) => {
  return res.sendFile('index.html', { root: ROOT_DIR });
});

// Serve whitelisted public HTML pages
app.get('/:page', (req, res, next) => {
  let page = req.params.page;
  if (!page.endsWith('.html')) {
    page = `${page}.html`;
  }
  const pageLower = page.toLowerCase();
  if (PUBLIC_HTML_PAGES.has(pageLower)) {
    return res.sendFile(pageLower, { root: ROOT_DIR });
  }
  next();
});

// 404 handler for any unmatched paths
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile('index.html', { root: ROOT_DIR });
  }
  return res.status(404).json({ error: 'not_found', message: 'Resource not found' });
});

// Start Server bound to 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`Vintisk Pharmaceuticals Web & Verification Server Running`);
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Persistent Storage: ${PERSISTENT_DATA_DIR ? PERSISTENT_DATA_DIR : 'Local repository directories'}`);
  console.log(`Batch Verification: http://localhost:${PORT}/batch-verification`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`=======================================================`);
});
