import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { authController } from "../../controllers/auth.controller.ts";
import { validate } from "../../middlewares/zod.middleware.ts";
import { createUserValidatorSchema, selectRoleValidatorSchema } from "../../validators/validator.ts";

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


authRouter.put(
    "/select-role",
    requireAuth(),
    validate(selectRoleValidatorSchema),
    authController.selectRoleHandler
)
export default authRouter;
