import { z } from "zod";

export const createUserValidatorSchema = z.object({
    email: z.string().trim().toLowerCase().email("invalid email address"),
    name: z
        .string()
        .trim()
        .min(3, "name must be at least 3 characters")
        .max(50, "name cannot be longer than 50 characters"),
    image: z.string().trim().url("invalid image url"),
    role: z.enum(["customer", "restaurant_owner", "delivery_rider"], {
        message: "role must be one of: customer, restaurant_owner, delivery_rider",
    }),
});

export type CreateUserInput = z.infer<typeof createUserValidatorSchema>;
