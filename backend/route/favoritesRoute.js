
import express from 'express';
import { toggleFavorite ,getFavorites } from '../controllers/favoritesController.js';

import authMiddleware from '../middleware/auth.js';

const favoritesRouter = express.Router();

favoritesRouter.post("/toggle", authMiddleware, toggleFavorite);

favoritesRouter.post("/get", authMiddleware, getFavorites);

export default favoritesRouter;