const express = require('express');

const {
  addComment,
  createPost,
  getPostById,
  getPosts,
  likePost
} = require('../controllers/postController');
const { requireApiAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireApiAuth);

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:id', getPostById);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);

module.exports = router;
