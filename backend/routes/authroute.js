import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  toggle2FA,
  deleteAccount,
  googleLogin,
} from '../controllers/authcontroller.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.put('/toggle-2fa', verifyToken, toggle2FA);
router.delete('/account', verifyToken, deleteAccount);


export default router;
