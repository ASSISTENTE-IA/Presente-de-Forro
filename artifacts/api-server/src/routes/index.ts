import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dedicationRouter from "./dedication";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dedicationRouter);

export default router;
