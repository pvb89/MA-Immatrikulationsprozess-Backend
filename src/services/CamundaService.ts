import fetch from "node-fetch";
import { User } from "../models/entity/User";
import { APIError } from './ResponseService';

class CamundaService {
    async getDocument(fileId: number): Promise<any> {
        try {
            return await fetch(process.env.DMS_CODIA_BASE_URL + '/o2/' + fileId + '/v/1_1/b/P1/c', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': process.env.DMS_CODIA_AUTH,
                }
            });
        } catch (error) {
            return Promise.reject(new APIError('Get Document failed'));
        }
    }
    async startProcess(data: any): Promise<any> {
        const camundaUrl = process.env.CAMUNDA_URL + process.env.CAMUNDA_PROCESS_ID + '/start';
        try {
            return await fetch(camundaUrl, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            return Promise.reject(new APIError('Start camunda process failed'));
        }
    }
}

export default CamundaService;