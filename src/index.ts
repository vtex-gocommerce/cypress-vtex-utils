import { Plugin } from './Plugin';
import { Logger } from './utils';
import { PluginOptions } from './PluginOptions';

type CypressInstallationCallback = (
  browser: Cypress.Browser,
  args: string[]
) => Promise<string[]> | string[];

interface CypressTasks {
  saveHar(options: PluginOptions): Promise<void>;
  recordHarConsole(options: PluginOptions): Promise<void>;
  removeHar(options: PluginOptions): Promise<void>;
  removeConsole(options: PluginOptions): Promise<void>;
  saveConsole(options: PluginOptions): Promise<void>;
}

type InstallationArg = CypressInstallationCallback | CypressTasks;

type CypressPluginEvent = 'before:browser:launch' | 'task';

type CypressCallback = (
  event: CypressPluginEvent,
  arg?: InstallationArg
) => void;

const DEFAULT_OPTIONS: PluginOptions = {
  file: './NetworkRequest.har',
  stubPath: '/__cypress/xhrs/'
};

const plugin: Plugin = new Plugin(Logger.Instance, DEFAULT_OPTIONS);

export function install(
  on: CypressCallback,
  config: Cypress.ConfigOptions
): void {
  const env: { [key: string]: any } = config?.env ?? {};

  const pluginOptions: PluginOptions = {
    file: env?.HAR_FILE ?? DEFAULT_OPTIONS.file,
    stubPath: env?.STUB_PATH ?? DEFAULT_OPTIONS.stubPath
  };

  plugin.configure(pluginOptions);

  on('task', {
    saveHar: (): Promise<void> => plugin.saveHar(),
    recordHarConsole: (): Promise<void> => plugin.recordHarConsole(),
    removeHar: (): Promise<void> => plugin.removeHar(),
    removeConsole: (): Promise<void> => plugin.removeConsole(),
    saveConsole: (): Promise<void> => plugin.saveConsole()
  });
}

export function ensureRequiredBrowserFlags(
  browser: Cypress.Browser,
  args: string[]
): string[] {
  return plugin.ensureRequiredBrowserFlags(browser, args);
}
