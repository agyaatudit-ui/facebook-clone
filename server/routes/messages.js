const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, markAsRead
} = require('../controllers/messageController');

router.get('/conversations', auth, getConversations);
router.post('/conversations', auth, getOrCreateConversation);
router.get('/conversations/:id/messages', auth, getMessages);
router.post('/', auth, sendMessage);
router.put('/conversations/:id/read', auth, markAsRead);

module.exports = router;
