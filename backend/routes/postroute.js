import express from 'express';
import { getPosts, createPost, likePost, replyToPost } from '../controllers/postcontroller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', verifyToken, createPost);
router.put('/:id/like', verifyToken, likePost);
router.post('/:id/reply', verifyToken, replyToPost);

export default router;
