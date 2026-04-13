import { AsyncLocalStorage } from "node:async_hooks";
import logger from "../config/logger.config.ts";

 type AsyncLocalStorageType = {
   correlationId:string 
}

export const asyncStorage = new AsyncLocalStorage<AsyncLocalStorageType>();

export const getCorrelationId = ()=> {
    try {
      const asyncStore = asyncStorage.getStore()
      const correlationId = asyncStore?.correlationId
      return correlationId  || "unknown error"
    } catch (error) {
         logger.error("error in getting correlation id")
    }
}