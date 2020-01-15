"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cdp_1 = require("./cdp");
const fs_1 = require("fs");
const util_1 = require("util");
const network_1 = require("./network");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
let consoleLog = '';
const severityIcons = {
    // 'verbose': ' ',
    info: '🛈',
    warning: '⚠',
    error: '⚠'
};
const access = util_1.promisify(fs_1.access);
const unlink = util_1.promisify(fs_1.unlink);
const writeFile = util_1.promisify(fs_1.writeFile);
class Plugin {
    constructor(logger, options) {
        this.logger = logger;
        this.options = options;
        this.requests = [];
        this.validatePluginOptions(options);
    }
    configure(options) {
        this.validatePluginOptions(options);
        this.options = options;
    }
    ensureRequiredBrowserFlags(browser, args) {
        if (!this.isChromeFamily(browser)) {
            throw new Error(`An unsupported browser family was used: ${browser.name}`);
        }
        args = this.ensureTestingFlags(args);
        args = this.ensureRdpPort(args);
        return args;
    }
    removeHar() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield access(this.options.file, fs_1.constants.F_OK);
                yield unlink(this.options.file);
            }
            catch (e) { }
            return null;
        });
    }
    removeConsole() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield access('./consoleLog.txt', fs_1.constants.F_OK);
                yield unlink('./consoleLog.txt');
            }
            catch (e) { }
            return null;
        });
    }
    recordHarConsole() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const factory = new cdp_1.CRIConnection({ port: this.rdpPort }, this.logger, new cdp_1.RetryStrategy(20, 5, 100));
            const chromeRemoteInterface = yield factory.open();
            chromeRemoteInterface.Log.enable();
            chromeRemoteInterface.Log.entryAdded(this.logEntry);
            chromeRemoteInterface.Runtime.enable();
            chromeRemoteInterface.Runtime.consoleAPICalled(this.logConsole);
            const networkObservable = new network_1.NetworkObserver(chromeRemoteInterface, this.logger, this.options);
            yield networkObservable.subscribe((request) => this.requests.push(request));
            return null;
        });
    }
    saveHar() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const har = yield new network_1.HarBuilder(this.requests).build();
                yield writeFile(this.options.file, JSON.stringify(har, null, 2));
            }
            catch (e) {
                this.logger.err(e.message);
            }
            return null;
        });
    }
    saveConsole() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield writeFile('./consoleLog.txt', consoleLog, { flag: 'a' });
            }
            catch (e) {
                this.logger.err(e.message);
            }
            return null;
        });
    }
    validatePluginOptions(options) {
        this.stubPathIsDefined(options.stubPath);
        this.fileIsDefined(options.file);
    }
    stubPathIsDefined(stubPath) {
        if (typeof stubPath !== 'string') {
            throw new Error('Stub path path must be a string.');
        }
    }
    fileIsDefined(file) {
        if (typeof file !== 'string') {
            throw new Error('File path must be a string.');
        }
    }
    isChromeFamily(browser) {
        var _a;
        return ['chrome', 'chromium', 'canary'].includes((_a = browser) === null || _a === void 0 ? void 0 : _a.name);
    }
    ensureTestingFlags(args) {
        return [
            ...new Set([
                ...args,
                '--headless',
                '--no-sandbox',
                '--disable-background-networking',
                '--disable-web-security',
                '--reduce-security-for-testing',
                '--allow-insecure-localhost',
                '--ignore-certificate-errors',
                '--disable-gpu'
            ])
        ];
    }
    ensureRdpPort(args) {
        this.rdpPort = this.getRdpPortFromArgs(args);
        if (this.rdpPort) {
            return args;
        }
        this.rdpPort = 40000 + Math.round(Math.random() * 25000);
        return [...args, `--remote-debugging-port=${this.rdpPort}`];
    }
    getRdpPortFromArgs(args) {
        const existing = args.find((arg) => arg.startsWith('--remote-debugging-port='));
        if (existing) {
            return +existing.split('=')[1];
        }
    }
    logEntry(params) {
        const { level, source, text, timestamp, url, lineNumber, stackTrace, args } = params.entry;
        const icon = severityIcons[level];
        const prefix = `[${new Date(timestamp).toISOString()}] ${icon} `;
        const prefixSpacer = ' '.repeat(prefix.length);
        separateLogs();
        writeConsoleLog(`${prefix}${chalk_1.default.bold(level)} (${source}): ${text}\n`);
        if (url) {
            writeConsoleLog(`${chalk_1.default.bold('URL')}: ${url}`);
        }
        if (stackTrace && lineNumber) {
            writeConsoleLog(`Stack trace line number: ${lineNumber}`);
            writeConsoleLog(`Stack trace description: ${stackTrace.description}`);
            writeConsoleLog(`Stack call frames: ${stackTrace.callFrames.join(', ')}`);
        }
        if (args) {
            hasArgs(args, prefixSpacer);
        }
    }
    logConsole(params) {
        const { type, args, timestamp } = params;
        const level = type === 'error' ? 'error' : 'verbose';
        const icon = severityIcons[level];
        const prefix = `[${new Date(timestamp).toISOString()}] ${icon} `;
        const prefixSpacer = ' '.repeat(prefix.length);
        separateLogs();
        writeConsoleLog(`${prefix}${chalk_1.default.bold(`console.${type}`)} called`);
        if (args) {
            hasArgs(args, prefixSpacer);
        }
    }
}
exports.Plugin = Plugin;
function writeConsoleLog(content) {
    consoleLog = consoleLog + '\n' + content;
}
function hasArgs(args, prefixSpacer) {
    writeConsoleLog(`Arguments:`);
    writeConsoleLog('  ' +
        JSON.stringify(args, null, 2)
            .split('\n')
            .join(`\n${prefixSpacer}  `)
            .trimRight());
}
function separateLogs() {
    writeConsoleLog("\n=========================================================================================================================================================================================================");
    writeConsoleLog("=========================================================================================================================================================================================================");
    writeConsoleLog("=========================================================================================================================================================================================================\n");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQkFBcUQ7QUFDckQsMkJBS1k7QUFDWiwrQkFBaUM7QUFFakMsdUNBQXdFO0FBR3hFLDBEQUEwQjtBQUMxQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFFcEIsTUFBTSxhQUFhLEdBQUc7SUFDcEIsa0JBQWtCO0lBQ2xCLElBQUksRUFBRSxJQUFJO0lBQ1YsT0FBTyxFQUFFLEdBQUc7SUFDWixLQUFLLEVBQUUsR0FBRztDQUNYLENBQUM7QUFDRixNQUFNLE1BQU0sR0FBRyxnQkFBUyxDQUFDLFdBQVEsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sTUFBTSxHQUFHLGdCQUFTLENBQUMsV0FBUSxDQUFDLENBQUM7QUFDbkMsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxjQUFXLENBQUMsQ0FBQztBQUN6QyxNQUFhLE1BQU07SUFHakIsWUFBNkIsTUFBYyxFQUFVLE9BQXNCO1FBQTlDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBRDFELGFBQVEsR0FBcUIsRUFBRSxDQUFDO1FBRS9DLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ00sU0FBUyxDQUFDLE9BQXNCO1FBQ3JDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBQ00sMEJBQTBCLENBQy9CLE9BQXdCLEVBQ3hCLElBQWM7UUFFZCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNqQyxNQUFNLElBQUksS0FBSyxDQUNiLDJDQUEyQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQzFELENBQUM7U0FDSDtRQUNELElBQUksR0FBRyxJ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QUFDM0MsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLElBQVMsRUFBRSxZQUFpQjtJQUMzQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUIsZUFBZSxDQUNiLElBQUk7UUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzFCLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDWCxJQUFJLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQzthQUMzQixTQUFTLEVBQUUsQ0FDakIsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLFlBQVk7SUFDbkIsZUFBZSxDQUFDLDZNQUE2TSxDQUFDLENBQUE7SUFDOU4sZUFBZSxDQUFDLDJNQUEyTSxDQUFDLENBQUE7SUFDNU4sZUFBZSxDQUFDLDZNQUE2TSxDQUFDLENBQUE7QUFFaE8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvZ2dlciB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBDUklDb25uZWN0aW9uLCBSZXRyeVN0cmF0ZWd5IH0gZnJvbSAnLi9jZHAnO1xyXG5pbXBvcnQge1xyXG4gIGFjY2VzcyBhcyBhY2Nlc3NDYixcclxuICBjb25zdGFudHMsXHJcbiAgdW5saW5rIGFzIHVubGlua0NiLFxyXG4gIHdyaXRlRmlsZSBhcyB3cml0ZUZpbGVDYlxyXG59IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCc7XHJcbmltcG9ydCB7IENocm9tZVJlbW90ZUludGVyZmFjZSB9IGZyb20gJ2Nocm9tZS1yZW1vdGUtaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgSGFyQnVpbGRlciwgTmV0d29ya09ic2VydmVyLCBOZXR3b3JrUmVxdWVzdCB9IGZyb20gJy4vbmV0d29yayc7XHJcbmltcG9ydCB7IEhhciB9IGZyb20gJ2hhci1mb3JtYXQnO1xyXG5pbXBvcnQgeyBQbHVnaW5PcHRpb25zIH0gZnJvbSAnLi9QbHVnaW5PcHRpb25zJztcclxuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcclxubGV0IGNvbnNvbGVMb2cgPSAnJztcclxuXHJcbmNvbnN0IHNldmVyaXR5SWNvbnMgPSB7XHJcbiAgLy8gJ3ZlcmJvc2UnOiAnICcsXHJcbiAgaW5mbzogJ/Cfm4gnLFxyXG4gIHdhcm5pbmc6ICfimqAnLFxyXG4gIGVycm9yOiAn4pqgJ1xyXG59O1xyXG5jb25zdCBhY2Nlc3MgPSBwcm9taXNpZnkoYWNjZXNzQ2IpO1xyXG5jb25zdCB1bmxpbmsgPSBwcm9taXNpZnkodW5saW5rQ2IpO1xyXG5jb25zdCB3cml0ZUZpbGUgPSBwcm9taXNpZnkod3JpdGVGaWxlQ2IpO1xyXG5leHBvcnQgY2xhc3MgUGx1Z2luIHtcclxuICBwcml2YXRlIHJkcFBvcnQ/OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSByZXF1ZXN0czogTmV0d29ya1JlcXVlc3RbXSA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyOiBMb2dnZXIsIHByaXZhdGUgb3B0aW9uczogUGx1Z2luT3B0aW9ucykge1xyXG4gICAgdGhpcy52YWxpZGF0ZVBsdWdpbk9wdGlvbnMob3B0aW9ucyk7XHJcbiAgfVxyXG4gIHB1YmxpYyBjb25maWd1cmUob3B0aW9uczogUGx1Z2luT3B0aW9ucyk6IHZvaWQge1xyXG4gICAgdGhpcy52YWxpZGF0ZVBsdWdpbk9wdGlvbnMob3B0aW9ucyk7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gIH1cclxuICBwdWJsaWMgZW5zdXJlUmVxdWlyZWRCcm93c2VyRmxhZ3MoXHJcbiAgICBicm93c2VyOiBDeXByZXNzLkJyb3dzZXIsXHJcbiAgICBhcmdzOiBzdHJpbmdbXVxyXG4gICk6IHN0cmluZ1tdIHtcclxuICAgIGlmICghdGhpcy5pc0Nocm9tZUZhbWlseShicm93c2VyKSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYEFuIHVuc3VwcG9ydGVkIGJyb3dzZXIgZmFtaWx5IHdhcyB1c2VkOiAke2Jyb3dzZXIubmFtZX1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBhcmdzID0gdGhpcy5lbnN1cmVUZXN0aW5nRmxhZ3MoYXJncyk7XHJcbiAgICBhcmdzID0gdGhpcy5lbnN1cmVSZHBQb3J0KGFyZ3MpO1xyXG5cclxuICAgIHJldHVybiBhcmdzO1xyXG4gIH1cclxuICBwdWJsaWMgYXN5bmMgcmVtb3ZlSGFyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgYWNjZXNzKHRoaXMub3B0aW9ucy5maWxlLCBjb25zdGFudHMuRl9PSyk7XHJcbiAgICAgIGF3YWl0IHVubGluayh0aGlzLm9wdGlvbnMuZmlsZSk7XHJcbiAgICB9IGNhdGNoIChlKSB7fVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBwdWJsaWMgYXN5bmMgcmVtb3ZlQ29uc29sZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGFjY2VzcygnLi9jb25zb2xlTG9nLnR4dCcsIGNvbnN0YW50cy5GX09LKTtcclxuICAgICAgYXdhaXQgdW5saW5rKCcuL2NvbnNvbGVMb2cudHh0Jyk7XHJcbiAgICB9IGNhdGNoIChlKSB7fVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuICBwdWJsaWMgYXN5bmMgcmVjb3JkSGFyQ29uc29sZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGZhY3Rvcnk6IENSSUNvbm5lY3Rpb24gPSBuZXcgQ1JJQ29ubmVjdGlvbihcclxuICAgICAgeyBwb3J0OiB0aGlzLnJkcFBvcnQgfSxcclxuICAgICAgdGhpcy5sb2dnZXIsXHJcbiAgICAgIG5ldyBSZXRyeVN0cmF0ZWd5KDIwLCA1LCAxMDApXHJcbiAgICApO1xyXG4gICAgY29uc3QgY2hyb21lUmVtb3RlSW50ZXJmYWNlOiBDaHJvbWVSZW1vdGVJbnRlcmZhY2UgPSBhd2FpdCBmYWN0b3J5Lm9wZW4oKTtcclxuICAgIGNocm9tZVJlbW90ZUludGVyZmFjZS5Mb2cuZW5hYmxlKCk7XHJcbiAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UuTG9nLmVudHJ5QWRkZWQodGhpcy5sb2dFbnRyeSk7XHJcbiAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UuUnVudGltZS5lbmFibGUoKTtcclxuICAgIGNocm9tZVJlbW90ZUludGVyZmFjZS5SdW50aW1lLmNvbnNvbGVBUElDYWxsZWQodGhpcy5sb2dDb25zb2xlKTtcclxuICAgIGNvbnN0IG5ldHdvcmtPYnNlcnZhYmxlOiBOZXR3b3JrT2JzZXJ2ZXIgPSBuZXcgTmV0d29ya09ic2VydmVyKFxyXG4gICAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UsXHJcbiAgICAgIHRoaXMubG9nZ2VyLFxyXG4gICAgICB0aGlzLm9wdGlvbnNcclxuICAgICk7XHJcbiAgICBhd2FpdCBuZXR3b3JrT2JzZXJ2YWJsZS5zdWJzY3JpYmUoKHJlcXVlc3Q6IE5ldHdvcmtSZXF1ZXN0KSA9PlxyXG4gICAgICB0aGlzLnJlcXVlc3RzLnB1c2gocmVxdWVzdClcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHB1YmxpYyBhc3luYyBzYXZlSGFyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaGFyOiBIYXIgPSBhd2FpdCBuZXcgSGFyQnVpbGRlcih0aGlzLnJlcXVlc3RzKS5idWlsZCgpO1xyXG4gICAgICBhd2FpdCB3cml0ZUZpbGUodGhpcy5vcHRpb25zLmZpbGUsIEpTT04uc3RyaW5naWZ5KGhhciwgbnVsbCwgMikpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlci5lcnIoZS5tZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHVibGljIGFzeW5jIHNhdmVDb25zb2xlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgd3JpdGVGaWxlKCcuL2NvbnNvbGVMb2cudHh0JywgY29uc29sZUxvZywgeyBmbGFnOiAnYScgfSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmVycihlLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2YWxpZGF0ZVBsdWdpbk9wdGlvbnMob3B0aW9uczogUGx1Z2luT3B0aW9ucyk6IHZvaWQgfCBuZXZlciB7XHJcbiAgICB0aGlzLnN0dWJQYXRoSXNEZWZpbmVkKG9wdGlvbnMuc3R1YlBhdGgpO1xyXG4gICAgdGhpcy5maWxlSXNEZWZpbmVkKG9wdGlvbnMuZmlsZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgc3R1YlBhdGhJc0RlZmluZWQoXHJcbiAgICBzdHViUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkXHJcbiAgKTogYXNzZXJ0cyBzdHViUGF0aCBpcyBzdHJpbmcge1xyXG4gICAgaWYgKHR5cGVvZiBzdHViUGF0aCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHViIHBhdGggcGF0aCBtdXN0IGJlIGEgc3RyaW5nLicpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwcml2YXRlIGZpbGVJc0RlZmluZWQoZmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogYXNzZXJ0cyBmaWxlIGlzIHN0cmluZyB7XHJcbiAgICBpZiAodHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBwYXRoIG11c3QgYmUgYSBzdHJpbmcuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgaXNDaHJvbWVGYW1pbHkoYnJvd3NlcjogQ3lwcmVzcy5Ccm93c2VyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gWydjaHJvbWUnLCAnY2hyb21pdW0nLCAnY2FuYXJ5J10uaW5jbHVkZXMoYnJvd3Nlcj8ubmFtZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZW5zdXJlVGVzdGluZ0ZsYWdzKGFyZ3M6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgLi4ubmV3IFNldChbXHJcbiAgICAgICAgLi4uYXJncyxcclxuICAgICAgICAnLS1oZWFkbGVzcycsXHJcbiAgICAgICAgJy0tbm8tc2FuZGJveCcsXHJcbiAgICAgICAgJy0tZGlzYWJsZS1iYWNrZ3JvdW5kLW5ldHdvcmtpbmcnLFxyXG4gICAgICAgICctLWRpc2FibGUtd2ViLXNlY3VyaXR5JyxcclxuICAgICAgICAnLS1yZWR1Y2Utc2VjdXJpdHktZm9yLXRlc3RpbmcnLFxyXG4gICAgICAgICctLWFsbG93LWluc2VjdXJlLWxvY2FsaG9zdCcsXHJcbiAgICAgICAgJy0taWdub3JlLWNlcnRpZmljYXRlLWVycm9ycycsXHJcbiAgICAgICAgJy0tZGlzYWJsZS1ncHUnXHJcbiAgICAgIF0pXHJcbiAgICBdO1xyXG4gIH1cclxuICBwcml2YXRlIGVuc3VyZVJkcFBvcnQoYXJnczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XHJcbiAgICB0aGlzLnJkcFBvcnQgPSB0aGlzLmdldFJkcFBvcnRGcm9tQXJncyhhcmdzKTtcclxuICAgIGlmICh0aGlzLnJkcFBvcnQpIHtcclxuICAgICAgcmV0dXJuIGFyZ3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJkcFBvcnQgPSA0MDAwMCArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDI1MDAwKTtcclxuXHJcbiAgICByZXR1cm4gWy4uLmFyZ3MsIGAtLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydD0ke3RoaXMucmRwUG9ydH1gXTtcclxuICB9XHJcbiAgcHJpdmF0ZSBnZXRSZHBQb3J0RnJvbUFyZ3MoYXJnczogc3RyaW5nW10pOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgY29uc3QgZXhpc3Rpbmc6IHN0cmluZyA9IGFyZ3MuZmluZCgoYXJnKSA9PlxyXG4gICAgICBhcmcuc3RhcnRzV2l0aCgnLS1yZW1vdGUtZGVidWdnaW5nLXBvcnQ9JylcclxuICAgICk7XHJcbiAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgcmV0dXJuICtleGlzdGluZy5zcGxpdCgnPScpWzFdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2dFbnRyeShwYXJhbXM6IGFueSkge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBsZXZlbCxcclxuICAgICAgc291cmNlLFxyXG4gICAgICB0ZXh0LFxyXG4gICAgICB0aW1lc3RhbXAsXHJcbiAgICAgIHVybCxcclxuICAgICAgbGluZU51bWJlcixcclxuICAgICAgc3RhY2tUcmFjZSxcclxuICAgICAgYXJnc1xyXG4gICAgfSA9IHBhcmFtcy5lbnRyeTtcclxuICAgIGNvbnN0IGljb24gPSBzZXZlcml0eUljb25zW2xldmVsXTtcclxuXHJcbiAgICBjb25zdCBwcmVmaXggPSBgWyR7bmV3IERhdGUodGltZXN0YW1wKS50b0lTT1N0cmluZygpfV0gJHtpY29ufSBgO1xyXG4gICAgY29uc3QgcHJlZml4U3BhY2VyID0gJyAnLnJlcGVhdChwcmVmaXgubGVuZ3RoKTtcclxuXHJcbiAgICBzZXBhcmF0ZUxvZ3MoKVxyXG4gICAgd3JpdGVDb25zb2xlTG9nKGAke3ByZWZpeH0ke2NoYWxrLmJvbGQobGV2ZWwpfSAoJHtzb3VyY2V9KTogJHt0ZXh0fVxcbmApO1xyXG5cclxuICAgIGlmICh1cmwpIHtcclxuICAgICAgd3JpdGVDb25zb2xlTG9nKGAke2NoYWxrLmJvbGQoJ1VSTCcpfTogJHt1cmx9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHN0YWNrVHJhY2UgJiYgbGluZU51bWJlcikge1xyXG4gICAgICB3cml0ZUNvbnNvbGVMb2coYFN0YWNrIHRyYWNlIGxpbmUgbnVtYmVyOiAke2xpbmVOdW1iZXJ9YCk7XHJcbiAgICAgIHdyaXRlQ29uc29sZUxvZyhgU3RhY2sgdHJhY2UgZGVzY3JpcHRpb246ICR7c3RhY2tUcmFjZS5kZXNjcmlwdGlvbn1gKTtcclxuICAgICAgd3JpdGVDb25zb2xlTG9nKGBTdGFjayBjYWxsIGZyYW1lczogJHtzdGFja1RyYWNlLmNhbGxGcmFtZXMuam9pbignLCAnKX1gKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXJncykge1xyXG4gICAgICBoYXNBcmdzKGFyZ3MsIHByZWZpeFNwYWNlcik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgbG9nQ29uc29sZShwYXJhbXM6IGFueSkge1xyXG4gICAgY29uc3QgeyB0eXBlLCBhcmdzLCB0aW1lc3RhbXAgfSA9IHBhcmFtcztcclxuICAgIGNvbnN0IGxldmVsID0gdHlwZSA9PT0gJ2Vycm9yJyA/ICdlcnJvcicgOiAndmVyYm9zZSc7XHJcbiAgICBjb25zdCBpY29uID0gc2V2ZXJpdHlJY29uc1tsZXZlbF07XHJcblxyXG4gICAgY29uc3QgcHJlZml4ID0gYFske25ldyBEYXRlKHRpbWVzdGFtcCkudG9JU09TdHJpbmcoKX1dICR7aWNvbn0gYDtcclxuICAgIGNvbnN0IHByZWZpeFNwYWNlciA9ICcgJy5yZXBlYXQocHJlZml4Lmxlbmd0aCk7XHJcbiAgICBzZXBhcmF0ZUxvZ3MoKVxyXG4gICAgd3JpdGVDb25zb2xlTG9nKGAke3ByZWZpeH0ke2NoYWxrLmJvbGQoYGNvbnNvbGUuJHt0eXBlfWApfSBjYWxsZWRgKTtcclxuICAgIGlmIChhcmdzKSB7XHJcbiAgICAgIGhhc0FyZ3MoYXJncywgcHJlZml4U3BhY2VyKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuZnVuY3Rpb24gd3JpdGVDb25zb2xlTG9nKGNvbnRlbnQ6IGFueSkge1xyXG4gIGNvbnNvbGVMb2cgPSBjb25zb2xlTG9nICsgJ1xcbicgKyBjb250ZW50O1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNBcmdzKGFyZ3M6IGFueSwgcHJlZml4U3BhY2VyOiBhbnkpIHtcclxuICB3cml0ZUNvbnNvbGVMb2coYEFyZ3VtZW50czpgKTtcclxuICB3cml0ZUNvbnNvbGVMb2coXHJcbiAgICAnICAnICtcclxuICAgICAgSlNPTi5zdHJpbmdpZnkoYXJncywgbnVsbCwgMilcclxuICAgICAgICAuc3BsaXQoJ1xcbicpXHJcbiAgICAgICAgLmpvaW4oYFxcbiR7cHJlZml4U3BhY2VyfSAgYClcclxuICAgICAgICAudHJpbVJpZ2h0KClcclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXBhcmF0ZUxvZ3MoKSB7XHJcbiAgd3JpdGVDb25zb2xlTG9nKFwiXFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XCIpICAgIFxyXG4gIHdyaXRlQ29uc29sZUxvZyhcIj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVwiKSAgICBcclxuICB3cml0ZUNvbnNvbGVMb2coXCI9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cXG5cIikgICAgXHJcblxyXG59XHJcbiJdfQ==