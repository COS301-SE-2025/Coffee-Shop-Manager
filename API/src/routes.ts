import { Router } from 'express';

import { authMiddleware } from './middleware/auth';

import { loginHandler } from './endpoint/login';
import { signupHandler } from './endpoint/signup';
import { createOrderHandler } from './endpoint/createOrder';

const router = Router();

// Default get request
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is live' });
});

router.post('/login', loginHandler);
router.post('/signup', signupHandler);
router.post('/create_order', authMiddleware, createOrderHandler);

export default router;
