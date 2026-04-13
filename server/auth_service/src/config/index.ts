// all the basic configurations like port number, database url, secret key for jwt etc will be stored in this file 

import dotenv from "dotenv"
dotenv.config()

type Config = {
    PORT: number,
    MONGO_URI: string,
    DB_NAME: string,
    CORS_ORIGIN: string,
    CLERK_PUBLISHABLE_KEY: string,
    CLERK_SECRET_KEY: string,
    CLERK_WEBHOOK_SECRET: string,
}


export function loadConfig() {
    dotenv.config()
}

loadConfig()

export const serverConfig : Config = {
   PORT: Number(process.env.PORT) || 3000,
   MONGO_URI: process.env.MONGO_URI || "",
   DB_NAME: process.env.DB_NAME || "",
   CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
   CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || "",
   CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
   CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || "",
}



