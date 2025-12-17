import express from "express";
import authMiddleware from "../middleware/auth.js";
import { 
  listOrders, 
  placeOrder, 
  updateStatus, 
  usersOrder, 
  verifyOrder, 
  removeOrder,
  getNewOrdersCount,   
  markAsSeen          
} from "../controllers/orderController.js";

const orderRouter = express.Router(); 

orderRouter.post("/place", authMiddleware, placeOrder); 
orderRouter.post("/verify", verifyOrder); 
orderRouter.post("/userorders", authMiddleware, usersOrder); 
orderRouter.post("/list", listOrders); 
orderRouter.post("/status", updateStatus); 
orderRouter.get("/newcount", getNewOrdersCount);           
orderRouter.post("/markseen", authMiddleware, markAsSeen); 

orderRouter.delete("/remove/:orderId", authMiddleware, removeOrder);

export default orderRouter;