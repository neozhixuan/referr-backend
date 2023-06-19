import express from "express";
import ReferralsController from "./referrals.controller.js";
import orgService from "./orgService.js";
import { Login, Signup, Logout } from "./authController.js";
import userVerification from "../middlewares/authMiddleware.js";
const router = new express.Router();

// Call the controller
router
  .route("/referrals")
  .get(ReferralsController.apiGetReferrals)
  .post(ReferralsController.apiPostReferral)
  .put(ReferralsController.apiUpdateReferral)
  .delete(ReferralsController.apiDeleteReview);
router.route("/like").put(ReferralsController.apiLikeReferral);
router.route("/logout").get(Logout);

router
  .route("/organisations")
  .get(orgService.apiGetOrganisations)
  .post(orgService.apiPostOrganisations);
router.route("/signup").post(Signup);
router.route("/login").post(Login);
router.post("/", userVerification);

export default router;
