const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const {protect} = require('../middlewares/authMiddleware');

const router=require('express').Router()

router.post('/',registerUser)
router.post('/login',authUser)
router.get('/',protect,allUsers)

module.exports = router;