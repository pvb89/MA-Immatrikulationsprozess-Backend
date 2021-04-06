import { NextFunction, Request, Response } from "express";
import { validate } from 'class-validator';
import { APIError } from '../services/ResponseService';
import { Entry } from "../models/entity/Entry";
import { IEntry } from "../models/IEntry";
import { IUser } from "../models/IUser";
import UserService from "../services/UserService"
import CourseService from "../services/CourseService"
import StatusService from "../services/StatusService";
import AuthentificationService from "../services/AuthentificationService";

const userService = new UserService();
const statusService = new StatusService();
const courseService = new CourseService();

class CourseController {

    public static getCourseEntrys = async (req: Request, res: Response, next: any) => {
        let data: any;
        let tokenDecoded: any;

        // Token decoden
        try {
            tokenDecoded = await AuthentificationService.decodeToken(req.headers)
        } catch (error) {
            return next(error);
        }

        // Course Einträge auslesen
        try {
            data = await courseService.findAllEntrysByUserId(tokenDecoded.userId);
        } catch (error) {
            return next(error);
        }

        // Userdaten löschen, da sie nicht benötigt werden
        data.map((entry: { user: IUser; }) => delete entry.user);

        // Daten zurücksenden
        res.json({
            success: true,
            message: "Get course entrys request succesfully",
            data: data
        })
    }

    public static updateStatus = async (req: Request, res: Response, next: any) => {
        const { statusId, courseId } = req.body;
        try {
            await courseService.updateState(statusId, courseId)
        } catch (error) {
            return next(error)
        }
        res.json({
            success: true,
            message: "Update course state succesfully",
            data: {}
        })
    }

    public static createCourseEntry = async (req: Request, res: Response, next: NextFunction) => {
        // Variablen und Objekte deklarieren
        let entry: IEntry = new Entry();
        let tokenDecoded: any;

        // Token decoden
        try {
            tokenDecoded = await AuthentificationService.decodeToken(req.headers)
        } catch (error) {
            return next(error);
        }

        // Entry Objekt aufbereiten
        entry = req.body;
        entry.date = new Date((Date.now()));
        entry.gender = req.body.gender.value;
        entry.healthInsuranceStatus = req.body.healthInsuranceStatus.value;
        entry.universityQualification = req.body.universityQualification.value;

        // User, Course und Status auslesen
        try {
            entry.user = await userService.findOneById(tokenDecoded.userId);
            entry.course = await courseService.findOneCourseById(req.body.course.value);
            entry.status = await statusService.findOneById(1);
        } catch (error) {
            return next(error);
        }

        // Entry validieren
        await validate(entry).catch(() => {
            return next(new APIError('Validate failed'))
        });

        // Entry in Datenbank speichern
        courseService.addCourseEntry(entry).then(entry => {
            res.json({
                success: true,
                message: "Add course request succesfully",
                data: entry.id
            })
        }
        ).catch(error => {
            next(error);
        })
    }

    public static postEducationCertificate = async (req: Request, res: Response, next: any) => {
        let tokenDecoded: any;
        let user: IUser;
        try {
            tokenDecoded = await AuthentificationService.decodeToken(req.headers)
            user = await userService.findOneById(tokenDecoded.userId);
            let fileId = await courseService.uploadDMS(req.files[0].buffer, req.files[0].originalname, user);
            await courseService.updateEducationCertificate(fileId, req.body.courseEntryId);
        } catch (error) {
            return next(error);
        }
        res.json({
            success: true,
            message: "Add course request succesfully",
            data: {}
        })
    }

}

export default CourseController;