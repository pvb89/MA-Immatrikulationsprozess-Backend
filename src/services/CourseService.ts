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
            console.log("error", error);
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
    async updateProcessId(processId: string, courseId: number): Promise<Entry | any> {
        try {
            return await getConnection()
                .createQueryBuilder()
                .update(Entry)
                .set({
                    processId: processId
                }).where("id = :id", { id: courseId })
                .execute();
        } catch (error) {
            return Promise.reject(new APIError('Update process Id failed'));
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
            const resTemp = await fetch('https://thb-immatrikulation-v2.d-velop.cloud/dms/r/b60769af-3f7d-4d12-95b4-3c8738052628/blob/chunk', {
                method: 'POST',
                body: file,
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': "Bearer vgXap/rReehmx+XLYVYGHxlt9GMeQIWlWzWYhsbacw3gSyjcXtbrkldeQBCXGoABMQaZVN8g+ww8Tu33SmihjPoB4U55aM4C/SV1uMMwXaE=&_z_A0V5ayCTfntt8TrRZ_x--XgSEm4Wg8ryuAwIuk47Cd1eUapzxTTygZ6AQBWZBsZKy5_iCV0d2-ePIdsLfmkpZdO34-Qhf",
                }
            });
            const tempFileName = resTemp.headers.get('location');
            const body = {
                filename: fileName,
                sourceCategory: "f3e42",
                sourceId: "/dms/r/b60769af-3f7d-4d12-95b4-3c8738052628/source",
                contentLocationUri: tempFileName,
                sourceProperties: {
                    properties: [{
                        key: "1",
                        values: [user.mail]
                    },
                    {
                        key: "2",
                        values: [user.firstname]
                    },
                    {
                        key: "3",
                        values: [user.lastname]
                    }]
                }
            };
            // Dokument eintragen
            const resUp = await fetch('https://thb-immatrikulation-v2.d-velop.cloud/dms/r/b60769af-3f7d-4d12-95b4-3c8738052628/o2m', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Authorization': "Bearer vgXap/rReehmx+XLYVYGHxlt9GMeQIWlWzWYhsbacw3gSyjcXtbrkldeQBCXGoABMQaZVN8g+ww8Tu33SmihjPoB4U55aM4C/SV1uMMwXaE=&_z_A0V5ayCTfntt8TrRZ_x--XgSEm4Wg8ryuAwIuk47Cd1eUapzxTTygZ6AQBWZBsZKy5_iCV0d2-ePIdsLfmkpZdO34-Qhf",
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