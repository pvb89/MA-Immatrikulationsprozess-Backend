import { Router } from 'express';
import Controller from '../controllers/CamundaController';
import CourseController from '../controllers/CourseController';
import checkJWT from '../middleware/checkJWT';

const router = Router();

router.post('/startProcess', [checkJWT], Controller.startProcess);
router.get('/getDocument/:id', Controller.getDocument);
router.put('/updateStatus', CourseController.updateStatus);

export default router;