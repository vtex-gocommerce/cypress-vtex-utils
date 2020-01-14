/// <reference types="cypress" />
import { Logger } from './utils';
import { PluginOptions } from './PluginOptions';
export declare class Plugin {
    private readonly logger;
    private options;
    private rdpPort?;
    private readonly requests;
    constructor(logger: Logger, options: PluginOptions);
    configure(options: PluginOptions): void;
    ensureRequiredBrowserFlags(browser: Cypress.Browser, args: string[]): string[];
    removeHar(): Promise<void>;
    removeConsole(): Promise<void>;
    recordHarConsole(): Promise<void>;
    saveHar(): Promise<void>;
    saveConsole(): Promise<void>;
    private validatePluginOptions;
    private stubPathIsDefined;
    private fileIsDefined;
    private isChromeFamily;
    private ensureTestingFlags;
    private ensureRdpPort;
    private getRdpPortFromArgs;
    private logEntry;
    private logConsole;
}
