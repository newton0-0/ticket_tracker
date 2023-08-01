const { Router } = require('express');
const authControllers = require('../controllers/authControllers');
const {requireAuth, checkUser} = require('../middleware/authMiddleware');

const router = Router();

router.get('/signup', authControllers.signup_get);
router.post('/signup', authControllers.signup_post);
router.get('/login', authControllers.login_get);
router.post('/login', authControllers.login_post);
router.get('/logout', authControllers.logout_get);
//router.get('/msg', authControllers.msg_get);
router.post('/stud', requireAuth, authControllers.stud_post);
router.get('/stud', requireAuth, authControllers.stud_get);
router.get('/admin', authControllers.admin_get);
router.post('/admin', authControllers.admin_post);
router.get('/dashboard', authControllers.dashboard_get);
router.get('/appeal', authControllers.dashboard_get);
router.get('/appeal/:id', authControllers.one_get);
router.post('/appeal/:id', authControllers.appeal_post);
router.get('/complaints', authControllers.complaint_get);
router.get('/complaints/:id', authControllers.getOneComplaint);
router.put('/complaints/:id', authControllers.putOneComplaint);
router.get('/complaint/:id', authControllers.deleteOneComplaint);
//router.get('/appealDelete/:id', authControllers.appealDelete);

module.exports = router