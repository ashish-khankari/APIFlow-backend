import { Router } from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  loginUser,
  registerUser,
  verifyToken,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.get("/user/:id", authenticateToken, getUser);
router.get("/users", authenticateToken, getUsers);
router.delete("/user/:id", authenticateToken, deleteUser);
router.post("/login", loginUser);
router.get("/auth/verify", authenticateToken, verifyToken);

export default router;
