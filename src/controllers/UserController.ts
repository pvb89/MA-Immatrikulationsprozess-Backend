import { Request, Response } from "express";
import { validate } from 'class-validator';
import { APIError } from '../services/ResponseService';
import { User } from "../models/entity/User";
import UserService from "../services/UserService"
import AuthentificationService from "../services/AuthentificationService";
import { IUser } from "../models/IUser";
const { google } = require('googleapis');

const service = new UserService();

class UserController {
  public static register = async (req: Request, res: Response, next: any) => {
    const { mail, password, firstname, lastname } = req.body;
    const user = new User();
    user.mail = mail;
    user.password = password;
    user.firstname = firstname;
    user.lastname = lastname;
    user.admin = false;
    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Register failed"
      });
    }
    user.password = AuthentificationService.hashPassword(password);
    service.add(user).then(users => {
      res.json({
        success: true,
        message: "Register succesfully",
        data: users
      })
    }
    ).catch(error => {
      next(error);
    })
  }

  public static login = async (req: Request, res: Response, next: any) => {
    let user: IUser;
    const { mail, password } = req.body;
    try {
      user = await service.findOneByMail(mail)
      const passwordValid: boolean = AuthentificationService.checkIfPasswordIsValid(password, user.password)
      if (!passwordValid) {
        return next(new APIError('Login failed'))
      }
      await service.updateLogin(user.id)
    } catch (error) {
      return next(error)
    }
    try {
      const token: string = AuthentificationService.createToken(user.id, user.admin);
      res.json({
        success: true,
        message: "Login succesfully",
        data: {
          token: token,
          user: {
            userId: user.id,
            mail: user.mail,
            firstname: user.firstname,
            lastname: user.lastname,
            admin: user.admin
          }
        }
      })
    } catch (error) {
      return next(error)
    }
  }

  public static googleLogin = async (req: Request, res: Response, next: any) => {
    let user: IUser;
    let token: string;
    let userId: any;

    // One-time-Code exchangen & Benutzerinformationen anfordern
    // const oauth2Client2 = new google.auth.OAuth2(
    //   process.env.GOOGLE_CLIENT_ID,
    //   process.env.GOOGLE_CLIENT_SECRET,
    //   process.env.GOOGLE_REDIRECT_URL
    // );
    const oauth2Client2 = new google.auth.OAuth2(
      "886486899739-h24t9ghtom4daj8omcfneo6k6f8c9dp0.apps.googleusercontent.com",
      "qvj3ddxWsPJdIErd3_I6YrSO",
      "postmessage"
    );
    const { tokens } = await oauth2Client2.getToken(req.body.token)
    oauth2Client2.setCredentials(tokens);
    const userinfo = await google.oauth2('v2').userinfo.get({
      auth: oauth2Client2,
    })
    const { email, given_name, family_name } = userinfo.data

    // Login durchführen und ggfs. Benutzer anlegen
    try {
      user = await service.findOneByMail(email)
      await service.updateLogin(user.id)
      userId = user.id
    } catch (error) {

      // Neuen Benutzer erstellen
      const user = new User();
      user.mail = email;
      user.password = AuthentificationService.hashPassword("initial"); // sDer Benutzer sollte nach dem Login direkt die Aufforderung bekommen sein Kennwort zu ändern
      user.firstname = given_name;
      user.lastname = family_name;
      user.admin = false;
      const errors = await validate(user);
      if (errors.length > 0) {
        return next(errors)
      }
      await service.add(user).then(user => {
        userId = user.id;
      }).catch(error => {
        return next(error);
      })
    }

    // Token erstellen & Login Datum updaten
    try {
      await service.updateLogin(userId)
      token = AuthentificationService.createToken(userId);
    } catch (error) {
      return next(error)
    }

    // Response senden, falls kein Error ausgelöst
    res.json({
      success: true,
      message: "Login succesfully",
      data: {
        token: token,
        user: {
          userId: userId,
          mail: email,
          firstname: given_name,
          lastname: family_name,
          admin: false
        }
      }
    })
  }
}

export default UserController;
