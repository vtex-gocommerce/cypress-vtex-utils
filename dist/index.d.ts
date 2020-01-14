/// <reference types="cypress" />
import { PluginOptions } from './PluginOptions';
declare type CypressInstallationCallback = (browser: Cypress.Browser, args: string[]) => Promise<string[]> | string[];
interface CypressTasks {
    saveHar(options: PluginOptions): Promise<void>;
    recordHarConsole(options: PluginOptions): Promise<void>;
    removeHar(options: PluginOptions): Promise<void>;
    removeConsole(options: PluginOptions): Promise<void>;
    saveConsole(options: PluginOptions): Promise<void>;
}
declare type InstallationArg = CypressInstallationCallback | CypressTasks;
declare type CypressPluginEvent = 'before:browser:launch' | 'task';
declare type CypressCallback = (event: CypressPluginEvent, arg?: InstallationArg) => void;
export declare function install(on: CypressCallback, config: Cypress.ConfigOptions): void;
export declare function ensureRequiredBrowserFlags(browser: Cypress.Browser, args: string[]): string[];
export {};
