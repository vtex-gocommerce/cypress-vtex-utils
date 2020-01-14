import { NetworkRequest } from './NetworkRequest';
import { Entry } from 'har-format';
export interface WsarWebSocketFrame {
    request?: string;
    response?: string;
    opcode: number;
    mask: boolean;
}
export declare class EntryBuilder {
    private readonly request;
    constructor(request: NetworkRequest);
    build(): Promise<Entry>;
    private getResponseBodySize;
    private getResponseCompression;
    private toMilliseconds;
    private buildRequest;
    private buildResponse;
    private buildContent;
    private buildTimings;
    private leastNonNegative;
    private buildPostData;
    private buildRequestURL;
    private buildWebSockets;
    private buildCookies;
    private buildSocket;
    private buildCookie;
    private requestBodySize;
}
