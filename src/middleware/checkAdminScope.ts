import { NextFunction, Request, Response } from "express";
import { APIError } from "../services/ResponseService";
import * as jwt from "jsonwebtoken";

const checkScope = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return next(new APIError('Auth token missed'));
  }
  const token: string = req.headers.authorization.split(' ')[1];
  var decoded: any = jwt.decode(token);
  
  if(!decoded.admin) {
    return next (new APIError('Admin rights missed'))
  } else {
    return next();
  }
}

export default checkScope