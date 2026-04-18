const express = require('express');

const {
  getHealth,
  getTodayHealth,
  getWeeklyHealth,
  logHealthActivity,
  updateHealth
} = require('../controllers/healthController');
const { requireApiAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireApiAuth);

router.get('/today', getTodayHealth);
router.get('/weekly', getWeeklyHealth);
router.post('/log', logHealthActivity);
router.get('/', getHealth);
router.put('/', updateHealth);

module.exports = router;
