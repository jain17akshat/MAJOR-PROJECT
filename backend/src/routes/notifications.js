const router = require('express').Router();
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');

router.get('/', getNotifications);
router.patch('/mark-all-read', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
