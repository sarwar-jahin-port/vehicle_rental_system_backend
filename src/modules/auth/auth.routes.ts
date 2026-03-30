import { Router } from "express";
import { authController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/signup", authController.createUser);

authRouter.post("/signin", authController.login);

export default authRouter;