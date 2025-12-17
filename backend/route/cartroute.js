import express from "express";

import { AddtoCart, removefromcart, getCart } from "../controllers/cartcontroller.js"; 
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, AddtoCart);

cartRouter.post("/remove", authMiddleware, removefromcart);

cartRouter.post("/get", authMiddleware, getCart);

export default cartRouter;
