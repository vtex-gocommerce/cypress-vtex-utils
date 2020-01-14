export declare class RetryStrategy {
    private _times;
    private initialBackoff;
    private readonly maximumBackoff;
    private readonly maxRetries;
    constructor(maxRetries: number, initialBackoff: number, maximumBackoff: number);
    getNextTime(): number | undefined;
    private getIncreaseBackoffTime;
}
