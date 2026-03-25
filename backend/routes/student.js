const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/studentController');

router.get('/dashboard', auth, studentController.getDashboardData);
router.post('/grade', auth, studentController.addGrade);
router.post('/attendance', auth, studentController.addAttendance);
router.put('/attendance/:id', auth, studentController.updateAttendance);
router.delete('/attendance/:id', auth, studentController.deleteAttendance);
router.post('/project', auth, studentController.addProject);
router.post('/hackathon', auth, studentController.addHackathon);
router.put('/hackathon/:id', auth, studentController.updateHackathon);
router.delete('/hackathon/:id', auth, studentController.deleteHackathon);
router.post('/certification', auth, studentController.addCertification);
router.post('/skill', auth, studentController.addSkill);

module.exports = router;
