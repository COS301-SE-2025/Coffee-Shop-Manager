import { Router } from 'express';
import { loginHandler } from './endpoint/login';

const router = Router();

// Default get request
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is live' });
});

router.post('/login', loginHandler);

export default router;
