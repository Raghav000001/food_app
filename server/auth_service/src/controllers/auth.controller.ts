import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { authService } from "../services/auth.service.ts";
import type { CreateUserDto } from "../dtos/auth.dtos.ts";

const registerUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreateUserDto;
    const user = await authService.createUserService(body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized — no valid session",
      });
      return;
    }

    const user = await authService.getUserByClerkIdService(userId);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  registerUserHandler,
  getMeHandler,
};
