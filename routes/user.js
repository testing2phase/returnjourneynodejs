import express from "express";
import {
  getMyProfile,
  login,
  logout,
  register,
  verify,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/verify", isAuthenticated, verify);

router.get("/infor", isAuthenticated, getMyProfile);

router.post("/login", login);

router.get("/logout", logout);

export default router;
