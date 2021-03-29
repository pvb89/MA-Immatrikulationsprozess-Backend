import { User } from "../models/entity/User";
import { getRepository } from 'typeorm';
import { IUser } from '../models/IUser';
import { APIError } from './ResponseService';

class UserService {
    async findOneByMail(mail: string): Promise<User | null> {
        try {
            const user: any = await getRepository('User').findOneOrFail({ mail: mail });
            return user
        } catch (error) {
            return Promise.reject(new APIError('User not found'));
        }
    }
    async findOneById(userId: number): Promise<User | null> {
        try {
            const user: any = await getRepository('User').findOneOrFail({ id: userId });
            return user
        } catch (error) {
            return Promise.reject(new APIError('User not found'));
        }
    }
    async add(model: IUser): Promise<User | any> {
        try {
            const savedUser = await getRepository('User').save(model);
            return savedUser;
        } catch (error) {
            return Promise.reject(new APIError('User already exist'));
        }
    }
    async updateLogin(userId: number): Promise<User | any> {
        try {
            await getRepository('User')
                .createQueryBuilder()
                .update('User')
                .set({ loginDate: new Date() })
                .where("id = :id", { id: userId })
                .execute();
        } catch (error) {
            return Promise.reject(new APIError('User update failed'));
        }
    }
}

export default UserService;