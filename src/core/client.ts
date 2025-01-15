import { RequestOptions } from './types';

export class EasyaClient {


    async request<T>(
        endpoint: string,
        method: string,
        options?: RequestOptions
    ): Promise<T> {
        return {} as T;
    }
}
