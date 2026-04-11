const express = require('express');

const {
  getCommunities,
  getCommunityById,
  joinCommunity
} = require('../controllers/communityController');
const { requireApiAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireApiAuth);

router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.post('/:id/join', joinCommunity);

module.exports = router;
