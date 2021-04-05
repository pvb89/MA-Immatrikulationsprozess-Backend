import { ICourse } from "./ICourse";
import { IStatus } from "./IStatus";
import { IUser } from "./IUser";

export interface IEntry {
    id?: number;
    user: IUser;
    course: ICourse;
    status: IStatus;
    date: Date;
    gender: string;
    bday: Date;
    birthplace: string;
    birthcountry: string;
    nationality: string;
    street: string;
    zipCode: number;
    domicile: string;
    country: string;
    universityQualification: string;
    averageGrade: number;
    healthInsuranceStatus: boolean;
    healthInsuranceName: string;
    healthInsuranceNumber: number;
    educationCertificateFile: string;
    processId: string;
}