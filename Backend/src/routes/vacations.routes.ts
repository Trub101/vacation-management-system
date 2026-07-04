import { Router } from "express";
import * as vacations from "../controllers/vacations.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

// Image serving is public so <img src="..."> tags work without auth headers.
router.get("/images/:filename", vacations.serveImage);

// Everything below requires a valid JWT.
router.use(authenticate);

router.get("/", asyncHandler(vacations.listVacations));
router.get("/reports/likes", requireAdmin, asyncHandler(vacations.likesReport));
router.get("/:id", asyncHandler(vacations.getVacation));

router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  asyncHandler(vacations.addVacation)
);
router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  asyncHandler(vacations.editVacation)
);
router.delete("/:id", requireAdmin, asyncHandler(vacations.removeVacation));

export default router;
