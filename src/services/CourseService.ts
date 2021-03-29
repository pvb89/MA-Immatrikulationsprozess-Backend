import { getRepository, getConnection } from 'typeorm';
import { APIError } from './ResponseService';
import { Course } from "../models/entity/Course";
import { Entry } from '../models/entity/Entry';
import { IEntry } from '../models/IEntry';
import fetch from 'node-fetch';
import { IUser } from '../models/IUser';

class CourseService {
    async findOneCourseById(courseId: number): Promise<Course | null> {
        try {
            const course: any = await getRepository('Course').findOneOrFail({ id: courseId });
            return course
        } catch (error) {
            return Promise.reject(new APIError('Get course failed'));
        }
    }
    async findOneCourseEntryById(courseEntryId: number): Promise<Course | null> {
        try {
            const course: any = await getRepository('Entry').findOneOrFail({ id: courseEntryId });
            return course
        } catch (error) {
            return Promise.reject(new APIError('Get course entry failed'));
        }
    }
    async findAllEntrysByUserId(userId: number): Promise<Entry | null> {
        try {
            const entry: any = await getRepository('Entry').find({ userId: userId })
            return entry
        } catch (error) {
            return Promise.reject(new APIError('Get course entry failed'));
        }
    }
    async addCourseEntry(model: IEntry): Promise<Entry | any> {
        try {
            const savedEntry = await getRepository('Entry').save(model);
            return savedEntry;
        } catch (error) {
            return Promise.reject(new APIError('Post course entry failed'));
        }
    }
    async updateState(statusId: number, courseId: number): Promise<Entry | any> {
        try {
            return await getConnection()
                .createQueryBuilder()
                .update(Entry)
                .set({
                    statusId: statusId
                }).where("id = :id", { id: courseId })
                .execute();
        } catch (error) {
            return Promise.reject(new APIError('Update state failed'));
        }
    }
    async updateEducationCertificate(fileId: string, courseId: number): Promise<Entry | any> {
        try {
            return await getConnection()
                .createQueryBuilder()
                .update(Entry)
                .set({
                    educationCertificateFile: fileId
                }).where("id = :id", { id: courseId })
                .execute();
        } catch (error) {
            return Promise.reject(new APIError('Update education certificate failed'));
        }
    }
    async uploadDMS(file: any, fileName: string, user: IUser) {
        let fileId: string;
        try {
            // Dokument hochladen
            const resTemp = await fetch(process.env.DMS_CODIA_BASE_URL + '/blob/chunk', {
                method: 'POST',
                body: file,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': process.env.DMS_CODIA_AUTH,
                }
            });
            const tempFileName = resTemp.headers.get('location');
            const body = {
                filename: fileName,
                sourceCategory: "9827b",
                sourceId: "/dms/r/87e12fe0-c015-45d5-ad12-1e1863045890/source",
                contentLocationUri: tempFileName,
                sourceProperties: {
                    properties: [{
                        key: "16",
                        values: [user.mail]
                    },
                    {
                        key: "21",
                        values: [user.firstname]
                    },
                    {
                        key: "22",
                        values: [user.lastname]
                    }]
                }
            };
            // Dokument eintragen
            const resUp = await fetch(process.env.DMS_CODIA_BASE_URL + '/o2m', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Authorization': process.env.DMS_CODIA_AUTH,
                }
            })
            fileId = resUp.headers.get('Location').split('/')[5].substring(0, 10);
        } catch (error) {
            return Promise.reject(new APIError('Document upload to the DMS failed'));
        }
        return fileId;
    }
}

export default CourseService;