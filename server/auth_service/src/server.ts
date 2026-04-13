import { genericErrorHandler } from "./middlewares/error.middleware.ts"
import { attachCorelationId } from "./middlewares/corelation.middleware.ts"
import express from "express"
import { connectDB } from "./config/db.config.ts"
import { serverConfig } from "./config/index.ts"
import { clerkMiddleware } from "@clerk/express"
const app = express()

app.use(clerkMiddleware())
app.use(attachCorelationId)

// Webhook routes need the raw body buffer for Svix signature verification.
// This must be registered BEFORE express.json() parses the body.
app.use("/api/v1/webhooks", express.raw({ type: "application/json" }))

// All other routes use the standard JSON parser
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))


import v1Router from "./routes/v1/index.routes.ts"

app.use("/api/v1",v1Router)


app.use(genericErrorHandler)


connectDB().then(()=> {
    app.listen(serverConfig.PORT,()=> {
        console.log("app is running on port",serverConfig.PORT);
    })
}).catch((error)=> {
    console.log("error connecting to database",error);
})