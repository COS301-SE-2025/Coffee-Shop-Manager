import { Router } from "express";

import { authMiddleware } from "./middleware/auth";

// USERS
import { loginHandler } from "./endpoints/user/login";
import { signupHandler } from "./endpoints/user/signup";
import { logoutHandler } from "./endpoints/user/logout";
import { deleteUserHandler } from "./endpoints/user/deleteUser";
import { getUserProfileHandler } from "./endpoints/user/getUser";
import { updateUserProfileHandler } from "./endpoints/user/updateUser";

// STOCK
import { getStockHandler } from "./endpoints/stock/getStock";
import { createStockHandler } from "./endpoints/stock/createStock";
import { updateStockByIdHandler } from "./endpoints/stock/updateStockId";
import { updateStockByIdOrNameHandler } from "./endpoints/stock/updateStockItem";
import { batchUpdateStockHandler } from "./endpoints/stock/updateStockBatch";
import { startStockTakeHandler } from "./endpoints/stock/stock_take/startStockTake";
import { saveStockTakeItemsHandler } from "./endpoints/stock/stock_take/saveStockTakeItems";
import { completeStockTakeHandler } from "./endpoints/stock/stock_take/completeStockTake";
import { getStockAdjustmentsHandler } from "./endpoints/stock/getStockAdjustments";

// ORDERS
import { getOrdersHandler } from "./endpoints/order/getOrders";
import { createOrderHandler } from "./endpoints/order/createOrder";

// PRODUCTS
import { createProductHandler } from "./endpoints/product/createProduct";
import { getProductsHandler } from "./endpoints/product/getProducts";
import { getProductsWithStockHandler } from "./endpoints/product/getProducts";
import { updateProductHandler } from "./endpoints/product/updateProduct";
import { deleteProductHandler } from "./endpoints/product/deleteProduct";

// LEGACY
import { checkTokenHandler } from "./endpoints/legacy/check-token";
import { getProductsHandler_old } from "./endpoints/legacy/getProducts_old";
import { updateOrderStatusHandler } from "./endpoints/legacy/update_order_status";
import { updateStockHandler } from "./endpoints/legacy/updateStock";

const router = Router();

// Default get request
router.get("/", (req, res) => {
  res.status(200).json({ message: "API is live" });
});

// USERS
router.get("/user/:id", getUserProfileHandler);
router.post("/login", loginHandler);
router.post("/signup", signupHandler);
router.post("/logout", logoutHandler);
router.delete("/user/:id", deleteUserHandler);
router.delete("/user", deleteUserHandler);
router.put("/user/:id", updateUserProfileHandler);

// STOCK
router.get("/stock/log", authMiddleware, getStockAdjustmentsHandler);
router.get("/stock", authMiddleware, getStockHandler);
router.get("/stock/:id", authMiddleware, getStockHandler);
router.post("/stock", authMiddleware, createStockHandler);
router.post("/stock/take", authMiddleware, startStockTakeHandler);
router.put("/stock/take", authMiddleware, saveStockTakeItemsHandler);
router.post("/stock/take/complete", authMiddleware, completeStockTakeHandler);
router.put("/stock", authMiddleware, updateStockByIdOrNameHandler);
router.put("/stock/batch", authMiddleware, batchUpdateStockHandler);
router.put("/stock/:id", authMiddleware, updateStockByIdHandler);

// ORDERS
router.get("/order", authMiddleware, getOrdersHandler);
router.post("/order", authMiddleware, createOrderHandler);

// PRODUCTS
router.get("/product/stock", authMiddleware, getProductsWithStockHandler);
router.get("/product/stock/:id", authMiddleware, getProductsWithStockHandler);
router.get("/product", authMiddleware, getProductsHandler);
router.get("/product/:id", authMiddleware, getProductsHandler);
router.post("/product", authMiddleware, createProductHandler);
router.put("/product", authMiddleware, updateProductHandler);
router.delete("/product/:id", authMiddleware, deleteProductHandler);

// LEGACY
router.post("/create_order", authMiddleware, createOrderHandler);
router.get("/get_orders", authMiddleware, getOrdersHandler);
router.get("/check-token", checkTokenHandler);
router.get("/getProducts", authMiddleware, getProductsHandler_old);
router.put("/update_order_status", authMiddleware, updateOrderStatusHandler);
router.get("/get_stock", authMiddleware, getStockHandler);
router.post("/update_stock", authMiddleware, updateStockHandler);

// Catch for undefined routes
router.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default router;
