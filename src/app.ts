import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from 'cors';
import friendsRoutes from "./routes/friendRoutes";
import { ApiError } from "./errors/errors"
import { Request, Response, NextFunction } from "express"
import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';

dotenv.config()
const debug = require("debug")("app")

const app = express()
app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));


app.use(express.json())

app.use((req, res, next) => {
  debug(new Date().toLocaleDateString(), req.method, req.originalUrl, req.ip)
  next()
})

app.use(express.static(path.join(process.cwd(), "public")))

app.use("/api/friends", friendsRoutes)

app.get("/demo", (req, res) => {
  res.send("Server is up");
})

//Our own default 404-handler for api-requests
app.use("/api", (req: any, res: any, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found" })
})

//Makes JSON error-response for ApiErrors, otherwise pass on to default error handleer
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof (ApiError)) {
    res.status(err.errorCode).json({ errorCode: 404, msg: err.message })
  } else {
    next(err)
  }
})

export default app;

//WINSTON/MORGAN-LOGGER (Use ONLY one of them)
// import logger, { stream } from "./middleware/logger";
// const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
// app.use(require("morgan")(morganFormat, { stream }));
// app.set("logger", logger) 
//The line above sets the logger as a global key on the application object
//You can now use it from all your middlewares like this req.app.get("logger").log("info","Message")
//Level can be one of the following: error, warn, info, http, verbose, debug, silly
//Level = "error" will go to the error file in production