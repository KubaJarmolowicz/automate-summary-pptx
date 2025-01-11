import { Router } from "express";
import presentationRoutes from "./presentation.routes";

const router = Router();

router.use("/api/presentations", presentationRoutes);

export default router;
