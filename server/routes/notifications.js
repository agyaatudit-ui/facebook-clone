const router = require('express').Router();
const auth = require('../middleware/auth');
const { getNotifications, markRead, getUnreadCount } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/read', auth, markRead);

module.exports = router;
