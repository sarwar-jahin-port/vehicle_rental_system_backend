import { Router } from 'express';
import { userController } from './user.controller';
import auth from '../../middleware/auth';

const userRouter = Router();

userRouter.get("/", auth("admin"), userController.getAllUsers);

userRouter.get("/:userId", auth("admin", "customer"), userController.getUserById);

userRouter.put("/:userId", auth("admin", "customer"), userController.updateUserById);

userRouter.delete("/:userId", auth("admin"), userController.deleteUserById);

export default userRouter;