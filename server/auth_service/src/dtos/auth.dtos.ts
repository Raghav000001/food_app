export interface CreateUserDto {
    name: string;
    email: string;
    image: string;
    role: "customer" | "restaurant_owner" | "delivery_rider";
    clerkId: string;
}

export interface UserResponseDto {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    image: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
