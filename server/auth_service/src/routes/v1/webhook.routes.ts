import { Router } from "express";
import { webhookController } from "../../controllers/webhook.controller.ts";

const webhookRouter = Router();

webhookRouter.post("/clerk", webhookController.clerkWebhookHandler);

export default webhookRouter;
