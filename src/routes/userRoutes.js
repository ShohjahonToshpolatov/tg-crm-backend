import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadPhoto,
  listUsers,
  changeUserRole,
  removeUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { uploadSingle } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.post("/me/photo", authMiddleware, uploadSingle("photo"), uploadPhoto);

router.get("/", authMiddleware, checkRole("admin"), listUsers);
router.patch("/:id/role", authMiddleware, checkRole("admin"), changeUserRole);
router.delete("/:id", authMiddleware, checkRole("admin"), removeUser);

export default router;
