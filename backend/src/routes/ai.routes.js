import { Router } from "express";
import { analyzeResume } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/analyze-resume").post(verifyJWT, analyzeResume);

export default router;