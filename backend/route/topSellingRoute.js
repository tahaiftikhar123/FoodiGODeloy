import express from "express";
import { getTopSellingByCart } from "../controllers/topSellingController.js";

const topSellingRouter = express.Router();

// Only one route is needed here to fetch the trending list
topSellingRouter.get("/list", getTopSellingByCart);

export default topSellingRouter;