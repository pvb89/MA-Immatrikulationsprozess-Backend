import { Router } from 'express';
import multer = require('multer');
import Controller from '../controllers/CourseController';
import checkJWT from '../middleware/checkJWT';

const upload = multer({});
const router = Router();

router.post('/entry', [checkJWT], Controller.createCourseEntry);
router.get('/entry', [checkJWT],Controller.getCourseEntrys);
router.post('/postEducationCertificate', [checkJWT, upload.any()], Controller.postEducationCertificate);

export default router;