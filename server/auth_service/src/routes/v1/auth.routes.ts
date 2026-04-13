import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { authController } from "../../controllers/auth.controller.ts";
import { validate } from "../../middlewares/zod.middleware.ts";
import { createUserValidatorSchema } from "../../validators/validator.ts";

const authRouter = Router();


authRouter.post(
    "/register",
    validate(createUserValidatorSchema),
    authController.registerUserHandler
);

authRouter.get(
    "/me",
    requireAuth(),
    authController.getMeHandler
);

export default authRouter;
