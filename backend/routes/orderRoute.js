import express from "express";
import {
 placeOrder, placeOrderWithStripe, allOrders, userOrders,updateStatus,
 verifyStripe
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place",authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderWithStripe); 
orderRouter.post("/list",adminAuth, allOrders);      
orderRouter.post("/userorders",authUser, userOrders);
orderRouter.post("/status",adminAuth, updateStatus);
orderRouter.post("/verifystripe",authUser,verifyStripe)

export default orderRouter;