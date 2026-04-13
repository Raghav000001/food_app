import type { Request, Response, NextFunction } from "express";
import { Webhook } from "svix";
import { serverConfig } from "../config/index.ts";
import { authService } from "../services/auth.service.ts";
import { badRequest, internalServerError } from "../errors/app.errors.ts";

// Shape of a Clerk user.created / user.updated event data
interface ClerkEmailAddress {
    email_address: string;
    id: string;
}

interface ClerkUserEventData {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
    image_url: string;
    primary_email_address_id: string;
}

interface ClerkWebhookEvent {
    type: string;
    data: ClerkUserEventData;
}

const clerkWebhookHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    console.log("Hook received! Headers:", req.headers);
    try {
        const webhookSecret = serverConfig.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) {
            throw new internalServerError("CLERK_WEBHOOK_SECRET is not configured");
        }

        // Svix sends these three headers — all required for verification
        const svixId = req.headers["svix-id"] as string;
        const svixTimestamp = req.headers["svix-timestamp"] as string;
        const svixSignature = req.headers["svix-signature"] as string;

        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new badRequest("Missing required Svix headers");
        }

        const payload = req.body as Buffer;

        const wh = new Webhook(webhookSecret);

        let event: ClerkWebhookEvent;

        // This throws if the signature is invalid — rejects forged requests
        event = wh.verify(payload, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as ClerkWebhookEvent;

        if (event.type === "user.created") {
            const data = event.data;

            const primaryEmail =
                data.email_addresses.find(
                    (e) => e.id === data.primary_email_address_id,
                ) ?? data.email_addresses[0];


            if (!primaryEmail) {
                throw new badRequest("No primary email found in Clerk event");
            }

            const name =
                [data.first_name, data.last_name]
                    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
                    .join(" ")
                    .trim() || primaryEmail.email_address.split("@")[0]!;

            await authService.createUserService({
                clerkId: data.id,
                name,
                email: primaryEmail.email_address,
                image: data.image_url,
                role: null,
            });

            res.status(201).json({
                success: true,
                message: "User created from Clerk webhook",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `Webhook event '${event.type}' received but not handled`,
        });
    } catch (error) {
        next(error);
    }
};

export const webhookController = {
    clerkWebhookHandler,
};
