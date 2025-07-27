import express from 'express';
import { getPendingComplaints, changeComplaintStatus } from '../controllers/adminController.js';
import { adminAuth } from '../middlware/adminAuth.js';

const router = express.Router();
router.get('/get-complaints', adminAuth,getPendingComplaints);
router.post('/change-status', changeComplaintStatus);

export default router;