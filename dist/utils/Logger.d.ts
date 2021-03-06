export declare class Logger {
    private static _instance;
    static get Instance(): Logger;
    info(msg: string): void;
    err(msg: string): void;
    warn(msg: string): void;
    private log;
}
