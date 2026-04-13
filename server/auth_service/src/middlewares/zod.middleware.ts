import express from "express";
import { ZodError, type ZodObject } from "zod";

export const validate = (schema: ZodObject) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
            success:false,
            errors:error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success:false,
        message:"internal server error"
      });
    }
  };
};
