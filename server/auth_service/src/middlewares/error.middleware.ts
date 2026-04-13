import type {  Request,Response, NextFunction } from "express";
import logger from "../config/logger.config.ts";
import type { AppError } from "../errors/app.errors.ts";

 export const genericErrorHandler = (err: AppError, req: Request, res: Response,next:NextFunction) => {
          logger.error(err)

         res.status(err.statusCode).json({
            success: false,
            message: err.message,
         })
 }