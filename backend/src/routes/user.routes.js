import { Router } from "express";
import { registerUser, loginUser, logoutUser, updateAccountDetails , updatePassword, uploadUserResume} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser); // We'll add a middleware here later
router.route("/update-info").patch(verifyJWT, updateAccountDetails);
router.route("/update-password").patch(verifyJWT, updatePassword);
router.route("/resume").patch(verifyJWT, upload.single("resume"), uploadUserResume);

export default router;