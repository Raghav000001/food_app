import { Router } from "express";
import pingRouter from "./ping.routes.ts";
import authRouter from "./auth.routes.ts";
import webhookRouter from "./webhook.routes.ts";

const v1Router = Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/webhooks", webhookRouter);

export default v1Router;
