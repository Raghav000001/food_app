import type { Request , Response } from "express"


const pingHandler = (req:Request,res:Response) : void => {
   res.send("pong")
}


export {
    pingHandler
}