import { Router } from 'express';

import { authMiddleware } from './middleware/auth';

// USERS
import { loginHandler } from './endpoint/login';
import { signupHandler } from './endpoint/signup';
import { logoutHandler } from './endpoint/logout';

// STOCK
import { getStockHandler } from './endpoint/getStock';
import { createStockHandler } from './endpoint/createStock';
import { updateStockByIdHandler } from './endpoint/updateStockId';
import { updateStockByIdOrNameHandler } from './endpoint/updateStockItem';
import { batchUpdateStockHandler } from './endpoint/updateStockBatch';

// ORDERS
import { getOrdersHandler } from './endpoint/getOrders';
import { createOrderHandler } from './endpoint/createOrder';

// PRODUCTS
import { createProductHandler } from './endpoint/createProduct';
import { getProductsHandler } from './endpoint/getProducts';
import { getProductsWithStockHandler } from './endpoint/getProducts';
import { updateProductHandler } from './endpoint/updateProduct';

// LEGACY
import { checkTokenHandler } from './endpoint/check-token'; 
import { getProductsHandler_old } from './endpoint/getProducts_old'; 
import { updateOrderStatusHandler } from './endpoint/update_order_status'; 
import { updateStockHandler } from './endpoint/updateStock';


const router = Router();

// Default get request
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is live' });
});


// USERS
router.post('/login', loginHandler);
router.post('/signup', signupHandler);
router.post('/logout', logoutHandler);

// STOCK
router.get('/stock', authMiddleware, getStockHandler);
router.post('/stock', authMiddleware, createStockHandler);
router.put('/stock', authMiddleware, updateStockByIdOrNameHandler);
router.put('/stock/batch', authMiddleware, batchUpdateStockHandler);
router.put('/stock/:id', authMiddleware, updateStockByIdHandler);


// ORDERS
router.get('/order', authMiddleware, getOrdersHandler);
router.post('/order', authMiddleware, createOrderHandler);

// PRODUCTS
router.get('/product', authMiddleware, getProductsHandler);
router.get('/product/stock', authMiddleware, getProductsWithStockHandler);
router.post('/product', authMiddleware, createProductHandler);
router.put('/product', authMiddleware, updateProductHandler);

// LEGACY
router.post('/create_order', authMiddleware, createOrderHandler);
router.get('/get_orders', authMiddleware, getOrdersHandler);
router.get('/check-token', checkTokenHandler); 
router.get('/getProducts', authMiddleware, getProductsHandler_old);
router.put('/update_order_status', authMiddleware, updateOrderStatusHandler);
router.get('/get_stock', authMiddleware, getStockHandler);
router.post('/update_stock', authMiddleware, updateStockHandler);


export default router;
