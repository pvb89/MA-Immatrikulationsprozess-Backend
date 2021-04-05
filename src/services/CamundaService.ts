import fetch from "node-fetch";
import { User } from "../models/entity/User";
import { APIError } from './ResponseService';

class CamundaService {
    async getDocument(fileId: number): Promise<any> {
        try {
            return await fetch('https://thb-immatrikulation-v2.d-velop.cloud/dms/r/b60769af-3f7d-4d12-95b4-3c8738052628/o2/' + fileId + '/v/1_1/b/main/c', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': 'Bearer vgXap/rReehmx+XLYVYGHxlt9GMeQIWlWzWYhsbacw3gSyjcXtbrkldeQBCXGoABMQaZVN8g+ww8Tu33SmihjPoB4U55aM4C/SV1uMMwXaE=&_z_A0V5ayCTfntt8TrRZ_x--XgSEm4Wg8ryuAwIuk47Cd1eUapzxTTygZ6AQBWZBsZKy5_iCV0d2-ePIdsLfmkpZdO34-Qhf'
                }
            });
        } catch (error) {
            return Promise.reject(new APIError('Get Document failed'));
        }
    }
    async startProcess(data: any): Promise<any> {
        // const camundaUrl = process.env.CAMUNDA_URL + process.env.CAMUNDA_PROCESS_ID + '/start';
        const camundaUrl = "http://pvb-camunda-v2.westeurope.azurecontainer.io:8080/engine-rest/process-definition/Immatrikulations_Prozess:2:61af1829-965a-11eb-adfd-00155d6e8f68/start"
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