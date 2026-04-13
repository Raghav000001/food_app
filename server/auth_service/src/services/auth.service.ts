import { authRepository } from "../repositories/auth.repositories.ts";
import { badRequest, internalServerError } from "../errors/app.errors.ts";
import type { CreateUserDto, UpdateRoleDto, UserResponseDto } from "../dtos/auth.dtos.ts";

// Create a new user — called from the Clerk webhook (user.created event)
const createUserService = async (data: CreateUserDto): Promise<UserResponseDto> => {
    // Guard: reject if a user with this clerkId already exists
    const existingByClerkId = await authRepository.findUserByClerkId(data.clerkId);
    if (existingByClerkId) {
        throw new badRequest("A user with this Clerk ID already exists");
    }

    // Guard: reject if a user with this email already exists
    const existingByEmail = await authRepository.findUserByEmail(data.email);
    if (existingByEmail) {
        throw new badRequest("A user with this email already exists");
    }

    const user = await authRepository.createUser(data);

    if (!user) {
        throw new internalServerError("Failed to create user");
    }

    const response: UserResponseDto = {
        id: String(user._id),
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    return response;
};

const getUserByClerkIdService = async (clerkId: string): Promise<UserResponseDto> => {
    const user = await authRepository.findUserByClerkId(clerkId);

    if (!user) {
        throw new badRequest("User not found");
    }

    const response: UserResponseDto = {
        id: String(user._id),
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    return response;
};

const updateRoleService = async (id: string, role: string): Promise<UserResponseDto> => {
    const user = await authRepository.updateRole(id, role);
    if (!user) {
        throw new badRequest("User not found");
    }
    const response: UserResponseDto = {
        id: String(user._id),
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
    return response
}

export const authService = {
    createUserService,
    getUserByClerkIdService,
    updateRoleService,
};
