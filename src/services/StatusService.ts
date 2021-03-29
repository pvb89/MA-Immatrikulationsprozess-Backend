import { getRepository } from 'typeorm';
import { APIError } from './ResponseService';
import { Status } from '../models/entity/Status';

class StatusService {
    async findOneById(statusId: number): Promise<Status | null> {
        try {
            const status: any = await getRepository('Status').findOneOrFail({ id: statusId });
            return status
        } catch (error) {
            return Promise.reject(new APIError('Status not found'));
        }
    }
}

export default StatusService;