import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import foodRouter from "./route/foodroute.js";
import helmet from "helmet";
import userRouter from "./route/userroute.js";
import cartRouter from "./route/cartroute.js";
import orderRouter from "./route/orderRoute.js";
import scheduleRouter from "./route/scheduleRoute.js";
import categoryRouter from "./route/categoryRoute.js";

import messageRouter from "./route/messageRoute.js";
import adminAuthRouter from "./route/dminAuthRoute.js";
import favoritesRouter from "./route/favoritesRoute.js";
import reviewRouter from "./route/reviewRoute.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 4000;

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("uploads"));
app.use("/api/category", categoryRouter);
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/review", reviewRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/user", adminAuthRouter);
app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server Started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
