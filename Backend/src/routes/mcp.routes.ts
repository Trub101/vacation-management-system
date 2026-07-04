import { Router } from "express";
import * as mcp from "../controllers/mcp.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);
router.post("/query", asyncHandler(mcp.query));

export default router;
