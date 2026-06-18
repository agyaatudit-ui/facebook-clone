const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getUser, updateProfile, uploadAvatar, uploadCover,
  searchUsers, sendFriendRequest, acceptFriendRequest,
  declineFriendRequest, unfriend, getFriendSuggestions
} = require('../controllers/userController');

router.get('/search', auth, searchUsers);
router.get('/suggestions', auth, getFriendSuggestions);
router.get('/:id', auth, getUser);
router.put('/profile', auth, updateProfile);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);
router.post('/cover', auth, upload.single('cover'), uploadCover);
router.post('/friend-request/:id', auth, sendFriendRequest);
router.post('/friend-request/:id/accept', auth, acceptFriendRequest);
router.post('/friend-request/:id/decline', auth, declineFriendRequest);
router.post('/unfriend/:id', auth, unfriend);

module.exports = router;
