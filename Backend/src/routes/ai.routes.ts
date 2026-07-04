import { Router } from "express";
import * as ai from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);
router.post("/recommend", asyncHandler(ai.recommend));

export default router;
