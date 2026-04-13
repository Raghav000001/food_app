
    import {v4 as uuid} from "uuid"
    import type { Request , Response ,NextFunction } from "express";  
    import { asyncStorage } from "../helpers/request.helper.ts";

     export const attachCorelationId = (req:Request,res:Response,next:NextFunction) => {
              
        const id = uuid()
        req.headers['correlation-id'] = id


        // add a correlation id in the async storage that we have created
           asyncStorage.run({correlationId:id},()=> {
                 next()
          })
 
    }