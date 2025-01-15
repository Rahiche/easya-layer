import { RequestOptions } from './types';
export declare class EasyaClient {
    request<T>(endpoint: string, method: string, options?: RequestOptions): Promise<T>;
}
