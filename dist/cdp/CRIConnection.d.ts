import { ChromeRemoteInterface, ChromeRemoteInterfaceOptions } from 'chrome-remote-interface';
import { RetryStrategy } from './RetryStrategy';
import { Logger } from '../utils';
export declare class CRIConnection {
    private readonly options;
    private readonly logger;
    private readonly retryStrategy;
    constructor(options: ChromeRemoteInterfaceOptions, logger: Logger, retryStrategy: RetryStrategy);
    open(): Promise<ChromeRemoteInterface>;
    private scheduleReconnect;
    private delay;
}
