import { Router } from "express";
import { loginAdmin, refreshToken } from "../controllers/authController.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/refresh", refreshToken);

export default router;
