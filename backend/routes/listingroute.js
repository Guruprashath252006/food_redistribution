import express from 'express';
import {
  getListings,
  createListing,
  requestListing,
  cancelRequest,
  verifyRequest,
  acceptRequest,
  rejectRequest,
  cancelListing,
} from '../controllers/listingcontroller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getListings);
router.post('/', verifyToken, createListing);
router.post('/:id/request', verifyToken, requestListing);
router.put('/:id/request/:rid/cancel', verifyToken, cancelRequest);
router.put('/:id/request/:rid/verify', verifyToken, verifyRequest);
router.put('/:id/request/:rid/accept', verifyToken, acceptRequest);
router.put('/:id/request/:rid/reject', verifyToken, rejectRequest);
router.put('/:id/cancel', verifyToken, cancelListing);

export default router;
