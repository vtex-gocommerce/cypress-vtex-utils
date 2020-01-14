"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cdp_1 = require("./cdp");
const fs_1 = require("fs");
const util_1 = require("util");
const network_1 = require("./network");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
var consoleLog = '';
const severityIcons = {
    //'verbose': ' ',
    'info': '🛈',
    'warning': '⚠',
    'error': '⚠',
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
                yield writeFile("./consoleLog.txt", consoleLog, { flag: 'a' });
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
    writeConsoleLog('  ' + JSON.stringify(args, null, 2).split('\n').join(`\n${prefixSpacer}  `).trimRight());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQkFBcUQ7QUFDckQsMkJBS1k7QUFDWiwrQkFBaUM7QUFFakMsdUNBQXdFO0FBR3hFLDBEQUEyQjtBQUMzQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFFcEIsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCO0lBQ2pCLE1BQU0sRUFBRSxJQUFJO0lBQ1osU0FBUyxFQUFFLEdBQUc7SUFDZCxPQUFPLEVBQUUsR0FBRztDQUNiLENBQUE7QUFDRCxNQUFNLE1BQU0sR0FBRyxnQkFBUyxDQUFDLFdBQVEsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sTUFBTSxHQUFHLGdCQUFTLENBQUMsV0FBUSxDQUFDLENBQUM7QUFDbkMsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxjQUFXLENBQUMsQ0FBQztBQUN6QyxNQUFhLE1BQU07SUFHakIsWUFBNkIsTUFBYyxFQUFVLE9BQXNCO1FBQTlDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBRDFELGFBQVEsR0FBcUIsRUFBRSxDQUFDO1FBRS9DLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ00sU0FBUyxDQUFDLE9BQXNCO1FBQ3JDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBQ00sMEJBQTBCLENBQy9CLE9BQXdCLEVBQ3hCLElBQWM7UUFFZCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNqQyxNQUFNLElBQUksS0FBSyxDQUNiLDJDQUEyQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQzFELENBQUM7U0FDSDtRQUNELElBQUksR0FBRyxJ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LFlBQWdCO0lBQ3hDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUM3QixlQUFlLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO0FBQzNHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2dnZXIgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgQ1JJQ29ubmVjdGlvbiwgUmV0cnlTdHJhdGVneSB9IGZyb20gJy4vY2RwJztcclxuaW1wb3J0IHtcclxuICBhY2Nlc3MgYXMgYWNjZXNzQ2IsXHJcbiAgY29uc3RhbnRzLFxyXG4gIHVubGluayBhcyB1bmxpbmtDYixcclxuICB3cml0ZUZpbGUgYXMgd3JpdGVGaWxlQ2JcclxufSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQgeyBDaHJvbWVSZW1vdGVJbnRlcmZhY2UgfSBmcm9tICdjaHJvbWUtcmVtb3RlLWludGVyZmFjZSc7XHJcbmltcG9ydCB7IEhhckJ1aWxkZXIsIE5ldHdvcmtPYnNlcnZlciwgTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuL25ldHdvcmsnO1xyXG5pbXBvcnQgeyBIYXIgfSBmcm9tICdoYXItZm9ybWF0JztcclxuaW1wb3J0IHsgUGx1Z2luT3B0aW9ucyB9IGZyb20gJy4vUGx1Z2luT3B0aW9ucyc7XHJcbmltcG9ydCBjaGFsayAgZnJvbSAnY2hhbGsnO1xyXG52YXIgY29uc29sZUxvZyA9ICcnO1xyXG5cclxuY29uc3Qgc2V2ZXJpdHlJY29ucyA9IHtcclxuICAvLyd2ZXJib3NlJzogJyAnLFxyXG4gICdpbmZvJzogJ/Cfm4gnLFxyXG4gICd3YXJuaW5nJzogJ+KaoCcsXHJcbiAgJ2Vycm9yJzogJ+KaoCcsXHJcbn1cclxuY29uc3QgYWNjZXNzID0gcHJvbWlzaWZ5KGFjY2Vzc0NiKTtcclxuY29uc3QgdW5saW5rID0gcHJvbWlzaWZ5KHVubGlua0NiKTtcclxuY29uc3Qgd3JpdGVGaWxlID0gcHJvbWlzaWZ5KHdyaXRlRmlsZUNiKTtcclxuZXhwb3J0IGNsYXNzIFBsdWdpbiB7XHJcbiAgcHJpdmF0ZSByZHBQb3J0PzogbnVtYmVyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVxdWVzdHM6IE5ldHdvcmtSZXF1ZXN0W10gPSBbXTtcclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogTG9nZ2VyLCBwcml2YXRlIG9wdGlvbnM6IFBsdWdpbk9wdGlvbnMpIHtcclxuICAgIHRoaXMudmFsaWRhdGVQbHVnaW5PcHRpb25zKG9wdGlvbnMpO1xyXG4gIH1cclxuICBwdWJsaWMgY29uZmlndXJlKG9wdGlvbnM6IFBsdWdpbk9wdGlvbnMpOiB2b2lkIHtcclxuICAgIHRoaXMudmFsaWRhdGVQbHVnaW5PcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICB9XHJcbiAgcHVibGljIGVuc3VyZVJlcXVpcmVkQnJvd3NlckZsYWdzKFxyXG4gICAgYnJvd3NlcjogQ3lwcmVzcy5Ccm93c2VyLFxyXG4gICAgYXJnczogc3RyaW5nW11cclxuICApOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWVGYW1pbHkoYnJvd3NlcikpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgIGBBbiB1bnN1cHBvcnRlZCBicm93c2VyIGZhbWlseSB3YXMgdXNlZDogJHticm93c2VyLm5hbWV9YFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgYXJncyA9IHRoaXMuZW5zdXJlVGVzdGluZ0ZsYWdzKGFyZ3MpO1xyXG4gICAgYXJncyA9IHRoaXMuZW5zdXJlUmRwUG9ydChhcmdzKTtcclxuICAgIHJldHVybiBhcmdzO1xyXG4gIH1cclxuICBwdWJsaWMgYXN5bmMgcmVtb3ZlSGFyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgYWNjZXNzKHRoaXMub3B0aW9ucy5maWxlLCBjb25zdGFudHMuRl9PSyk7XHJcbiAgICAgIGF3YWl0IHVubGluayh0aGlzLm9wdGlvbnMuZmlsZSk7XHJcbiAgICB9IGNhdGNoIChlKSB7fVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHB1YmxpYyBhc3luYyByZW1vdmVDb25zb2xlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgYWNjZXNzKCcuL2NvbnNvbGVMb2cudHh0JywgY29uc3RhbnRzLkZfT0spO1xyXG4gICAgICBhd2FpdCB1bmxpbmsoJy4vY29uc29sZUxvZy50eHQnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHVibGljIGFzeW5jIHJlY29yZEhhckNvbnNvbGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBmYWN0b3J5OiBDUklDb25uZWN0aW9uID0gbmV3IENSSUNvbm5lY3Rpb24oXHJcbiAgICAgIHsgcG9ydDogdGhpcy5yZHBQb3J0IH0sXHJcbiAgICAgIHRoaXMubG9nZ2VyLFxyXG4gICAgICBuZXcgUmV0cnlTdHJhdGVneSgyMCwgNSwgMTAwKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGNocm9tZVJlbW90ZUludGVyZmFjZTogQ2hyb21lUmVtb3RlSW50ZXJmYWNlID0gYXdhaXQgZmFjdG9yeS5vcGVuKCk7XHJcbiAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UuTG9nLmVuYWJsZSgpXHJcbiAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UuTG9nLmVudHJ5QWRkZWQodGhpcy5sb2dFbnRyeSlcclxuICAgIGNocm9tZVJlbW90ZUludGVyZmFjZS5SdW50aW1lLmVuYWJsZSgpXHJcbiAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UuUnVudGltZS5jb25zb2xlQVBJQ2FsbGVkKHRoaXMubG9nQ29uc29sZSlcclxuICAgIGNvbnN0IG5ldHdvcmtPYnNlcnZhYmxlOiBOZXR3b3JrT2JzZXJ2ZXIgPSBuZXcgTmV0d29ya09ic2VydmVyKFxyXG4gICAgICBjaHJvbWVSZW1vdGVJbnRlcmZhY2UsXHJcbiAgICAgIHRoaXMubG9nZ2VyLFxyXG4gICAgICB0aGlzLm9wdGlvbnNcclxuICAgICk7XHJcbiAgICBhd2FpdCBuZXR3b3JrT2JzZXJ2YWJsZS5zdWJzY3JpYmUoKHJlcXVlc3Q6IE5ldHdvcmtSZXF1ZXN0KSA9PlxyXG4gICAgICB0aGlzLnJlcXVlc3RzLnB1c2gocmVxdWVzdClcclxuICAgICk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgcHVibGljIGFzeW5jIHNhdmVIYXIoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBoYXI6IEhhciA9IGF3YWl0IG5ldyBIYXJCdWlsZGVyKHRoaXMucmVxdWVzdHMpLmJ1aWxkKCk7XHJcbiAgICAgIGF3YWl0IHdyaXRlRmlsZSh0aGlzLm9wdGlvbnMuZmlsZSwgSlNPTi5zdHJpbmdpZnkoaGFyLCBudWxsLCAyKSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmVycihlLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIHB1YmxpYyBhc3luYyBzYXZlQ29uc29sZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHdyaXRlRmlsZShcIi4vY29uc29sZUxvZy50eHRcIiwgY29uc29sZUxvZyx7ZmxhZzonYSd9KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgdGhpcy5sb2dnZXIuZXJyKGUubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgXHJcbiAgcHJpdmF0ZSB2YWxpZGF0ZVBsdWdpbk9wdGlvbnMob3B0aW9uczogUGx1Z2luT3B0aW9ucyk6IHZvaWQgfCBuZXZlciB7XHJcbiAgICB0aGlzLnN0dWJQYXRoSXNEZWZpbmVkKG9wdGlvbnMuc3R1YlBhdGgpO1xyXG4gICAgdGhpcy5maWxlSXNEZWZpbmVkKG9wdGlvbnMuZmlsZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgc3R1YlBhdGhJc0RlZmluZWQoXHJcbiAgICBzdHViUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkXHJcbiAgKTogYXNzZXJ0cyBzdHViUGF0aCBpcyBzdHJpbmcge1xyXG4gICAgaWYgKHR5cGVvZiBzdHViUGF0aCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHViIHBhdGggcGF0aCBtdXN0IGJlIGEgc3RyaW5nLicpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwcml2YXRlIGZpbGVJc0RlZmluZWQoZmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogYXNzZXJ0cyBmaWxlIGlzIHN0cmluZyB7XHJcbiAgICBpZiAodHlwZW9mIGZpbGUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBwYXRoIG11c3QgYmUgYSBzdHJpbmcuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgaXNDaHJvbWVGYW1pbHkoYnJvd3NlcjogQ3lwcmVzcy5Ccm93c2VyKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gWydjaHJvbWUnLCAnY2hyb21pdW0nLCAnY2FuYXJ5J10uaW5jbHVkZXMoYnJvd3Nlcj8ubmFtZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgZW5zdXJlVGVzdGluZ0ZsYWdzKGFyZ3M6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgLi4ubmV3IFNldChbXHJcbiAgICAgICAgLi4uYXJncyxcclxuICAgICAgICAnLS1oZWFkbGVzcycsXHJcbiAgICAgICAgJy0tbm8tc2FuZGJveCcsXHJcbiAgICAgICAgJy0tZGlzYWJsZS1iYWNrZ3JvdW5kLW5ldHdvcmtpbmcnLFxyXG4gICAgICAgICctLWRpc2FibGUtd2ViLXNlY3VyaXR5JyxcclxuICAgICAgICAnLS1yZWR1Y2Utc2VjdXJpdHktZm9yLXRlc3RpbmcnLFxyXG4gICAgICAgICctLWFsbG93LWluc2VjdXJlLWxvY2FsaG9zdCcsXHJcbiAgICAgICAgJy0taWdub3JlLWNlcnRpZmljYXRlLWVycm9ycycsXHJcbiAgICAgICAgJy0tZGlzYWJsZS1ncHUnXHJcbiAgICAgIF0pXHJcbiAgICBdO1xyXG4gIH1cclxuICBwcml2YXRlIGVuc3VyZVJkcFBvcnQoYXJnczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XHJcbiAgICB0aGlzLnJkcFBvcnQgPSB0aGlzLmdldFJkcFBvcnRGcm9tQXJncyhhcmdzKTtcclxuICAgIGlmICh0aGlzLnJkcFBvcnQpIHtcclxuICAgICAgcmV0dXJuIGFyZ3M7XHJcbiAgICB9XHJcbiAgICB0aGlzLnJkcFBvcnQgPSA0MDAwMCArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDI1MDAwKTtcclxuICAgIHJldHVybiBbLi4uYXJncywgYC0tcmVtb3RlLWRlYnVnZ2luZy1wb3J0PSR7dGhpcy5yZHBQb3J0fWBdO1xyXG4gIH1cclxuICBwcml2YXRlIGdldFJkcFBvcnRGcm9tQXJncyhhcmdzOiBzdHJpbmdbXSk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICBjb25zdCBleGlzdGluZzogc3RyaW5nID0gYXJncy5maW5kKChhcmcpID0+XHJcbiAgICAgIGFyZy5zdGFydHNXaXRoKCctLXJlbW90ZS1kZWJ1Z2dpbmctcG9ydD0nKVxyXG4gICAgKTtcclxuICAgIGlmIChleGlzdGluZykge1xyXG4gICAgICByZXR1cm4gK2V4aXN0aW5nLnNwbGl0KCc9JylbMV07XHJcbiAgICB9XHJcbiAgfVxyXG4gICBcclxuICBwcml2YXRlIGxvZ0VudHJ5KHBhcmFtczphbnkpIHtcclxuICAgIGNvbnN0IHsgbGV2ZWwsIHNvdXJjZSwgdGV4dCwgdGltZXN0YW1wLCB1cmwsIGxpbmVOdW1iZXIsIHN0YWNrVHJhY2UsIGFyZ3MgfSA9IHBhcmFtcy5lbnRyeVxyXG4gICAgY29uc3QgaWNvbiA9IHNldmVyaXR5SWNvbnNbbGV2ZWxdXHJcbiAgXHJcbiAgICBjb25zdCBwcmVmaXggPSBgWyR7bmV3IERhdGUodGltZXN0YW1wKS50b0lTT1N0cmluZygpfV0gJHtpY29ufSBgXHJcbiAgICBjb25zdCBwcmVmaXhTcGFjZXIgPSAnICcucmVwZWF0KHByZWZpeC5sZW5ndGgpXHJcbiAgICAgICAgICBcclxuICAgIHdyaXRlQ29uc29sZUxvZyhgJHtwcmVmaXh9JHtjaGFsay5ib2xkKGxldmVsKX0gKCR7c291cmNlfSk6ICR7dGV4dH1cXG5gKTtcclxuICAgIFxyXG4gICAgICAgIFxyXG4gICAgaWYgKHVybCkge1xyXG4gICAgICB3cml0ZUNvbnNvbGVMb2coYCR7Y2hhbGsuYm9sZCgnVVJMJyl9OiAke3VybH1gKVxyXG4gICAgfVxyXG4gIFxyXG4gICAgaWYgKHN0YWNrVHJhY2UgJiYgbGluZU51bWJlcikge1xyXG4gICAgICB3cml0ZUNvbnNvbGVMb2coYFN0YWNrIHRyYWNlIGxpbmUgbnVtYmVyOiAke2xpbmVOdW1iZXJ9YClcclxuICAgICAgd3JpdGVDb25zb2xlTG9nKGBTdGFjayB0cmFjZSBkZXNjcmlwdGlvbjogJHtzdGFja1RyYWNlLmRlc2NyaXB0aW9ufWApXHJcbiAgICAgIHdyaXRlQ29uc29sZUxvZyhgU3RhY2sgY2FsbCBmcmFtZXM6ICR7c3RhY2tUcmFjZS5jYWxsRnJhbWVzLmpvaW4oJywgJyl9YClcclxuICAgIH1cclxuICBcclxuICAgIGlmIChhcmdzKSB7XHJcbiAgICAgIGhhc0FyZ3MoYXJncywgcHJlZml4U3BhY2VyKTtcclxuICAgIH1cclxuICB9XHJcbiAgcHJpdmF0ZSBsb2dDb25zb2xlKHBhcmFtczphbnkpIHtcclxuICAgIGNvbnN0IHsgdHlwZSwgYXJncywgdGltZXN0YW1wIH0gPSBwYXJhbXNcclxuICAgIGNvbnN0IGxldmVsID0gdHlwZSA9PT0gJ2Vycm9yJyA/ICdlcnJvcicgOiAndmVyYm9zZSdcclxuICAgIGNvbnN0IGljb24gPSBzZXZlcml0eUljb25zW2xldmVsXVxyXG4gIFxyXG4gICAgY29uc3QgcHJlZml4ID0gYFske25ldyBEYXRlKHRpbWVzdGFtcCkudG9JU09TdHJpbmcoKX1dICR7aWNvbn0gYFxyXG4gICAgY29uc3QgcHJlZml4U3BhY2VyID0gJyAnLnJlcGVhdChwcmVmaXgubGVuZ3RoKVxyXG4gICAgd3JpdGVDb25zb2xlTG9nKGAke3ByZWZpeH0ke2NoYWxrLmJvbGQoYGNvbnNvbGUuJHt0eXBlfWApfSBjYWxsZWRgKVxyXG4gICAgaWYgKGFyZ3MpIHtcclxuICAgICAgaGFzQXJncyhhcmdzLCBwcmVmaXhTcGFjZXIpO1xyXG4gICAgfVxyXG4gIH1cclxuIFxyXG59XHJcbmZ1bmN0aW9uIHdyaXRlQ29uc29sZUxvZyhjb250ZW50OmFueSkge1xyXG4gIGNvbnNvbGVMb2cgPSBjb25zb2xlTG9nICsgJ1xcbicgKyBjb250ZW50XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhc0FyZ3MoYXJnczphbnkscHJlZml4U3BhY2VyOmFueSkge1xyXG4gIHdyaXRlQ29uc29sZUxvZyhgQXJndW1lbnRzOmApXHJcbiAgd3JpdGVDb25zb2xlTG9nKCcgICcgKyBKU09OLnN0cmluZ2lmeShhcmdzLCBudWxsLCAyKS5zcGxpdCgnXFxuJykuam9pbihgXFxuJHtwcmVmaXhTcGFjZXJ9ICBgKS50cmltUmlnaHQoKSlcclxufSJdfQ==