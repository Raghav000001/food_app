export interface CreateUserDto {
    name: string;
    email: string;
    image: string;
    role: "customer" | "restaurant_owner" | "delivery_rider" | null;
    clerkId: string;
}

export interface UpdateRoleDto {
    role: "customer" | "restaurant_owner" | "delivery_rider";
}

export interface UserResponseDto {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    image: string;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
}
