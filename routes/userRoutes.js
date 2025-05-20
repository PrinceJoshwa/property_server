import express from "express"
import { googleLogin, getUserProfile } from "../controllers/userController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/google-login", googleLogin)
router.get("/profile", protect, getUserProfile)

export default router
