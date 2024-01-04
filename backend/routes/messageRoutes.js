const { allMessages, sendMessage } = require('../controllers/messageControllers');
const { protect } = require('../middlewares/authMiddleware');

const router=require('express').Router();

router.post('/',protect,sendMessage);
router.get('/:chatId',protect,allMessages);

module.exports = router;