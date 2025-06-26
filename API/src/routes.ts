import { Router } from 'express';

import { authMiddleware } from './middleware/auth';

import { loginHandler } from './endpoint/login';
import { signupHandler } from './endpoint/signup';
import { createOrderHandler } from './endpoint/createOrder';
import { getOrdersHandler } from './endpoint/getOrders';
import { logoutHandler } from './endpoint/logout';
import { checkTokenHandler } from './endpoint/check-token'; 
import { getProductsHandler } from './endpoint/getProducts'; 
import { updateOrderStatusHandler } from './endpoint/update_order_status'; 

const router = Router();

// Default get request
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is live' });
});

router.post('/login', loginHandler);
router.post('/signup', signupHandler);
router.post('/create_order', authMiddleware, createOrderHandler);
router.get('/get_orders', authMiddleware, getOrdersHandler);
router.post('/logout', logoutHandler);
router.get('/check-token', checkTokenHandler); 
router.get('/getProducts', authMiddleware, getProductsHandler);
router.put('/update_order_status', authMiddleware, updateOrderStatusHandler);


export default router;
