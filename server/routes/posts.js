const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost, getPosts, getUserPosts,
  likePost, commentPost, deletePost
} = require('../controllers/postController');

router.get('/', auth, getPosts);
router.get('/user/:id', auth, getUserPosts);
router.post('/', auth, upload.single('image'), createPost);
router.post('/:id/like', auth, likePost);
router.post('/:id/comment', auth, commentPost);
router.delete('/:id', auth, deletePost);

module.exports = router;
