import { Router } from "express";

import { authMiddleware } from "./middleware/auth";

// GAMIFICATION
import { getUserStatsHandler } from "./endpoints/gamification/getUserStats";
import { getUserBadgesHandler } from "./endpoints/gamification/getUserBadges";
import { getLeaderboardHandler } from "./endpoints/gamification/getLeaderboard";

// USERS
import { loginHandler } from "./endpoints/user/login";
import { signupHandler } from "./endpoints/user/signup";
import { logoutHandler } from "./endpoints/user/logout";
import { deleteUserHandler } from "./endpoints/user/deleteUser";
import { getUserProfileHandler } from "./endpoints/user/getUser";
import { updateUserProfileHandler } from "./endpoints/user/updateUser";
import { getUserEmailsHandler } from "./endpoints/user/getUserEmails";
import { getUserPointsHistoryHandler } from "./endpoints/user/getPointsHistory";
import { redeemLoyaltyPointsHandler } from "./endpoints/user/redeemPoints";
import { getRecommendationsHandler } from "./endpoints/user/getRecommendation";

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
import { deleteStockHandler } from "./endpoints/stock/deleteStock";

// ORDERS
import { getOrdersHandler } from "./endpoints/order/getOrders";
import { createOrderHandler } from "./endpoints/order/createOrder";
import { createOrderByEmailHandler } from "./endpoints/order/createOrderByEmail";
import { updateOrderPaidStatusHandler } from "./endpoints/order/payOrder";

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

// PAYMENT
import { initiatePaymentHandler } from "../src/endpoints/payment/paymentHandler";
import { paymentNotificationHandler } from "./endpoints/payment/paymentNotification";

const router = Router();

// Default get request
router.get("/", (req, res) => {
  res.status(200).json({ message: "API is live" });
});

// GAMIFICATION
router.get("/user/stats", authMiddleware, getUserStatsHandler);
router.get("/user/badges", authMiddleware, getUserBadgesHandler);
router.get("/leaderboard", authMiddleware, getLeaderboardHandler); 

// USERS
router.get("/user/recommendation", authMiddleware, getRecommendationsHandler);
router.get("/user/points", authMiddleware, getUserPointsHistoryHandler);
router.post("/user/points", authMiddleware, redeemLoyaltyPointsHandler);
router.get("/user/emails", authMiddleware, getUserEmailsHandler);
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
router.delete("/stock/:id", authMiddleware, deleteStockHandler);

// ORDERS
router.get("/order", authMiddleware, getOrdersHandler);
router.post("/order", authMiddleware, createOrderHandler);
router.post("/order/email", authMiddleware, createOrderByEmailHandler);
router.post("/order/pay/:id", authMiddleware, updateOrderPaidStatusHandler);

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
router.post("/get_orders", authMiddleware, getOrdersHandler);
router.get("/check-token", checkTokenHandler);
router.get("/getProducts", authMiddleware, getProductsHandler_old);
router.put("/update_order_status", authMiddleware, updateOrderStatusHandler);
router.get("/get_stock", authMiddleware, getStockHandler);
router.post("/update_stock", authMiddleware, updateStockHandler);

// PAYMENT
router.post("/initiate-payment", authMiddleware, initiatePaymentHandler);
router.post("/payment/notify", paymentNotificationHandler);

// Catch for undefined routes
router.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default router;
