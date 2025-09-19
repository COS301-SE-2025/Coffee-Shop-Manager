import { Router } from "express";

import { authMiddleware } from "./middleware/auth";

// USERS
import { loginHandler } from "./endpoint/login";
import { signupHandler } from "./endpoint/signup";
import { logoutHandler } from "./endpoint/logout";
import { deleteUserHandler } from "./endpoint/deleteUser";
import { getUserProfileHandler } from "./endpoint/getUser";
import { updateUserProfileHandler } from "./endpoint/updateUser";

// STOCK
import { getStockHandler } from "./endpoint/getStock";
import { createStockHandler } from "./endpoint/createStock";
import { updateStockByIdHandler } from "./endpoint/updateStockId";
import { updateStockByIdOrNameHandler } from "./endpoint/updateStockItem";
import { batchUpdateStockHandler } from "./endpoint/updateStockBatch";
import { startStockTakeHandler } from "./endpoint/startStockTake";
import { saveStockTakeItemsHandler } from "./endpoint/saveStockTakeItems";
import { completeStockTakeHandler } from "./endpoint/completeStockTake";
import { getStockAdjustmentsHandler } from "./endpoint/getStockAdjustments";

// ORDERS
import { getOrdersHandler } from "./endpoint/getOrders";
import { createOrderHandler } from "./endpoint/createOrder";

// PRODUCTS
import { createProductHandler } from "./endpoint/createProduct";
import { getProductsHandler } from "./endpoint/getProducts";
import { getProductsWithStockHandler } from "./endpoint/getProducts";
import { updateProductHandler } from "./endpoint/updateProduct";
import { deleteProductHandler } from "./endpoint/deleteProduct";

// LEGACY
import { checkTokenHandler } from "./endpoint/check-token";
import { getProductsHandler_old } from "./endpoint/getProducts_old";
import { updateOrderStatusHandler } from "./endpoint/update_order_status";
import { updateStockHandler } from "./endpoint/updateStock";

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

export default router;
