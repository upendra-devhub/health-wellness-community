const express = require('express');
const path = require('path');

const router = express.Router();
const publicDir = path.join(__dirname, '../public');
const uploadsDir = path.join(__dirname, '../uploads');

// Serve static files
router.use(express.static(publicDir));
router.use('/uploads', express.static(uploadsDir));

// Serve page routes - HTML files
router.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'landing.html'));
});

router.get('/app', (req, res) => {
  res.sendFile(path.join(publicDir, 'app.html'));
});

router.get('/sign-in', (req, res) => {
  res.sendFile(path.join(publicDir, 'sign-in.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(publicDir, 'register.html'));
});

// 404 for pages
router.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, 'landing.html'));
});

module.exports = router;
