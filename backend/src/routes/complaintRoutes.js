const express = require('express');
const {
    lodgeComplaint,
    getMyComplaints,
    getAllComplaints,
    getComplaintDetails,
    updateStatus,
    addCaseUpdate,
    addEvidence
} = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, lodgeComplaint);
router.get('/my', authMiddleware, getMyComplaints); // For Victims
router.get('/station', authMiddleware, getAllComplaints); // For Officers
router.get('/:id', authMiddleware, getComplaintDetails);
router.put('/:id/status', authMiddleware, updateStatus);
router.post('/:id/updates', authMiddleware, addCaseUpdate);
router.post('/:id/evidence', authMiddleware, addEvidence);

module.exports = router;
