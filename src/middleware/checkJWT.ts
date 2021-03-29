import { NextFunction, Request, Response } from "express";
import { APIError } from "../services/ResponseService";
import * as jwt from "jsonwebtoken";

const checkJWT = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return next(new APIError('Auth token missed'));
  }
  const token: string = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return next(new APIError('Auth token invalid'));
  });
  return next();
}

export default checkJWT