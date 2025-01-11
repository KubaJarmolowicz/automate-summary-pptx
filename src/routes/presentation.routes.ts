import { Router } from "express";
import { PresentationController } from "../controllers/PresentationController";

const router = Router();
const presentationController = new PresentationController();

router.post(
  "/generate",
  presentationController.generate.bind(presentationController)
);

export default router;
