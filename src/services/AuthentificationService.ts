import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcrypt';
import { APIError } from "./ResponseService";
import { IncomingHttpHeaders } from "http";

class AuthentificationService {
  static createToken(userId: number, isAdmin: boolean = false): string {
    return jwt.sign({
      userId: userId,
      admin: isAdmin
    }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
  }
  static async decodeToken(reqHeader: IncomingHttpHeaders): Promise<string | {[key: string]: any; }> {
    try {
      const tokenEncoded: string = reqHeader.authorization.split(' ')[1];
      return jwt.decode(tokenEncoded);
    } catch (err) {
      return new APIError('Auth token invalid'); 
    }
  }
  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 8);
  }
  static checkIfPasswordIsValid(unencryptedPassword: string, cryptedPassword: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, cryptedPassword) ;
  }
}

export default AuthentificationService;