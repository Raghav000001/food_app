import mongoose, { Schema, Document } from "mongoose";
import type { CreateUserDto } from "../dtos/auth.dtos.ts";

export interface IUser extends CreateUserDto, Document {
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["customer", "restaurant_owner", "delivery_rider"],
            default: "customer",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;