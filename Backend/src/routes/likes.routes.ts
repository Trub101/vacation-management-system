import { Router } from "express";
import * as likes from "../controllers/likes.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireUser } from "../middleware/admin.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate, requireUser);

router.post("/:vacationId", asyncHandler(likes.addLike));
router.delete("/:vacationId", asyncHandler(likes.removeLike));

export default router;
