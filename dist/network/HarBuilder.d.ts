import { Har } from 'har-format';
import { NetworkRequest } from './NetworkRequest';
export declare class HarBuilder {
    private readonly chromeRequests;
    constructor(chromeRequests: NetworkRequest[]);
    build(): Promise<Har>;
}
