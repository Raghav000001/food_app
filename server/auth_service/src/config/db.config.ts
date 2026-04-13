import mongoose from "mongoose";
import { serverConfig } from "../config/index.ts";
import logger from "./logger.config.ts";

export async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(`${serverConfig.MONGO_URI}/${serverConfig.DB_NAME}`)
        if (connectionInstance) {
            logger.info(`Database connected successfully, host : ${connectionInstance.connection.host}`)
        }
    } catch (error) {
        logger.error("Error connecting to database", error)
        process.exit(1)
    }
}
