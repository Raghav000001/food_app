import User from "../models/user.modal.ts";
import type { CreateUserDto } from "../dtos/auth.dtos.ts";
import type { IUser } from "../models/user.modal.ts";

const createUser = async (data: CreateUserDto): Promise<IUser> => {
    const user = await User.create(data);
    return user;
};

const findUserByClerkId = async (clerkId: string): Promise<IUser | null> => {
    const user = await User.findOne({ clerkId });
    return user;
};

const findUserByEmail = async (email: string): Promise<IUser | null> => {
    const user = await User.findOne({ email });
    return user;
};
const findUserById = async (id: string): Promise<IUser | null> => {
    const user = await User.findById(id);
    return user;
};

export const authRepository = {
    createUser,
    findUserByClerkId,
    findUserByEmail,
    findUserById,
};
