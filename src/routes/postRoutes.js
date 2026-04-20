const express = require('express');

const {
  addComment,
  createPost,
  deletePost,
  getPostById,
  getPosts,
  likePost
} = require('../controllers/postController');
const { requireApiAuth } = require('../middleware/auth');
const { uploadPostImage } = require('../middleware/upload');
const { uploadToClodinary } = require("../middleware/cloudnire.upload");

const router = express.Router();

router.use(requireApiAuth);

router.get('/', getPosts);
router.post(
  '/',
  uploadPostImage,
  uploadToClodinary,
  createPost
);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comment', addComment);

module.exports = router;
