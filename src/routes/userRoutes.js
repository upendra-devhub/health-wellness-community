const express = require('express');

const { getProfile, updateProfile } = require('../controllers/userController');
const { requireApiAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireApiAuth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
