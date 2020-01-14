"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chrome_remote_interface_1 = tslib_1.__importDefault(require("chrome-remote-interface"));
class CRIConnection {
    constructor(options, logger, retryStrategy) {
        this.options = options;
        this.logger = logger;
        this.retryStrategy = retryStrategy;
    }
    open() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info('Attempting to connect to Chrome Debugging Protocol');
                const { host, port } = this.options;
                const chromeRemoteInterface = yield chrome_remote_interface_1.default({
                    host,
                    port
                });
                const { Security } = chromeRemoteInterface;
                yield Security.enable();
                yield Security.setOverrideCertificateErrors({ override: true });
                Security.certificateError(({ eventId }) => Security.handleCertificateError({ eventId, action: 'continue' }));
                this.logger.info('Connected to Chrome Debugging Protocol');
                chromeRemoteInterface.once('disconnect', () => this.logger.info('Chrome Debugging Protocol disconnected'));
                return chromeRemoteInterface;
            }
            catch (e) {
                this.logger.err(`Failed to connect to Chrome Debugging Protocol: ${e.message}`);
                return this.scheduleReconnect();
            }
        });
    }
    scheduleReconnect() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const timeout = this.retryStrategy.getNextTime();
            if (!timeout) {
                throw new Error(`Failed to connect to Chrome Debugging Protocol.`);
            }
            yield this.delay(timeout);
            return this.open();
        });
    }
    delay(timeout) {
        return new Promise((resolve) => setTimeout(resolve, timeout));
    }
}
exports.CRIConnection = CRIConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1JJQ29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jZHAvQ1JJQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4RkFHaUM7QUFLakMsTUFBYSxhQUFhO0lBQ3hCLFlBQ21CLE9BQXFDLEVBQ3JDLE1BQWMsRUFDZCxhQUE0QjtRQUY1QixZQUFPLEdBQVAsT0FBTyxDQUE4QjtRQUNyQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2Qsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDNUMsQ0FBQztJQUNTLElBQUk7O1lBQ2YsSUFBSTtnQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO2dCQUN2RSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ3BDLE1BQU0scUJBQXFCLEdBQTBCLE1BQU0saUNBQTRCLENBQ3JGO29CQUNFLElBQUk7b0JBQ0osSUFBSTtpQkFDTCxDQUNGLENBQUM7Z0JBQ0YsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLHFCQUFxQixDQUFDO2dCQUMzQyxNQUFNLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxRQUFRLENBQUMsNEJBQTRCLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDaEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQ3hDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FDakUsQ0FBQztnQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO2dCQUUzRCxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUMzRCxDQUFDO2dCQUNGLE9BQU8scUJBQXFCLENBQUM7YUFDOUI7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDYixtREFBbUQsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUMvRCxDQUFDO2dCQUNGLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDakM7UUFDSCxDQUFDO0tBQUE7SUFDYSxpQkFBaUI7O1lBQzdCLE1BQU0sT0FBTyxHQUF1QixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JFLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO2FBQ3BFO1lBQ0QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FBQTtJQUNPLEtBQUssQ0FBQyxPQUFlO1FBQzNCLE9BQU8sSUFBSSxPQUFPLENBQ2hCLENBQUMsT0FBTyxFQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUNuRCxDQUFDO0lBQ0osQ0FBQztDQUVGO0FBakRELHNDQWlEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaHJvbWVSZW1vdGVJbnRlcmZhY2VGYWN0b3J5LCB7XHJcbiAgQ2hyb21lUmVtb3RlSW50ZXJmYWNlLFxyXG4gIENocm9tZVJlbW90ZUludGVyZmFjZU9wdGlvbnNcclxufSBmcm9tICdjaHJvbWUtcmVtb3RlLWludGVyZmFjZSc7XHJcbmltcG9ydCB7IFJldHJ5U3RyYXRlZ3kgfSBmcm9tICcuL1JldHJ5U3RyYXRlZ3knO1xyXG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCBUaW1lb3V0ID0gTm9kZUpTLlRpbWVvdXQ7XHJcblxyXG5leHBvcnQgY2xhc3MgQ1JJQ29ubmVjdGlvbiB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9wdGlvbnM6IENocm9tZVJlbW90ZUludGVyZmFjZU9wdGlvbnMsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjogTG9nZ2VyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSByZXRyeVN0cmF0ZWd5OiBSZXRyeVN0cmF0ZWd5XHJcbiAgKSB7fVxyXG4gIHB1YmxpYyBhc3luYyBvcGVuKCk6IFByb21pc2U8Q2hyb21lUmVtb3RlSW50ZXJmYWNlPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKCdBdHRlbXB0aW5nIHRvIGNvbm5lY3QgdG8gQ2hyb21lIERlYnVnZ2luZyBQcm90b2NvbCcpO1xyXG4gICAgICBjb25zdCB7IGhvc3QsIHBvcnQgfSA9IHRoaXMub3B0aW9ucztcclxuICAgICAgY29uc3QgY2hyb21lUmVtb3RlSW50ZXJmYWNlOiBDaHJvbWVSZW1vdGVJbnRlcmZhY2UgPSBhd2FpdCBjaHJvbWVSZW1vdGVJbnRlcmZhY2VGYWN0b3J5KFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGhvc3QsXHJcbiAgICAgICAgICBwb3J0XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCB7IFNlY3VyaXR5IH0gPSBjaHJvbWVSZW1vdGVJbnRlcmZhY2U7XHJcbiAgICAgIGF3YWl0IFNlY3VyaXR5LmVuYWJsZSgpO1xyXG4gICAgICBhd2FpdCBTZWN1cml0eS5zZXRPdmVycmlkZUNlcnRpZmljYXRlRXJyb3JzKHsgb3ZlcnJpZGU6IHRydWUgfSk7XHJcbiAgICAgIFNlY3VyaXR5LmNlcnRpZmljYXRlRXJyb3IoKHsgZXZlbnRJZCB9KSA9PlxyXG4gICAgICAgIFNlY3VyaXR5LmhhbmRsZUNlcnRpZmljYXRlRXJyb3IoeyBldmVudElkLCBhY3Rpb246ICdjb250aW51ZScgfSlcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5sb2dnZXIuaW5mbygnQ29ubmVjdGVkIHRvIENocm9tZSBEZWJ1Z2dpbmcgUHJvdG9jb2wnKTtcclxuICAgXHJcbiAgICAgIGNocm9tZVJlbW90ZUludGVyZmFjZS5vbmNlKCdkaXNjb25uZWN0JywgKCkgPT5cclxuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdDaHJvbWUgRGVidWdnaW5nIFByb3RvY29sIGRpc2Nvbm5lY3RlZCcpXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBjaHJvbWVSZW1vdGVJbnRlcmZhY2U7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyLmVycihcclxuICAgICAgICBgRmFpbGVkIHRvIGNvbm5lY3QgdG8gQ2hyb21lIERlYnVnZ2luZyBQcm90b2NvbDogJHtlLm1lc3NhZ2V9YFxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gdGhpcy5zY2hlZHVsZVJlY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBwcml2YXRlIGFzeW5jIHNjaGVkdWxlUmVjb25uZWN0KCk6IFByb21pc2U8Q2hyb21lUmVtb3RlSW50ZXJmYWNlPiB7XHJcbiAgICBjb25zdCB0aW1lb3V0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB0aGlzLnJldHJ5U3RyYXRlZ3kuZ2V0TmV4dFRpbWUoKTtcclxuICAgIGlmICghdGltZW91dCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjb25uZWN0IHRvIENocm9tZSBEZWJ1Z2dpbmcgUHJvdG9jb2wuYCk7XHJcbiAgICB9XHJcbiAgICBhd2FpdCB0aGlzLmRlbGF5KHRpbWVvdXQpO1xyXG4gICAgcmV0dXJuIHRoaXMub3BlbigpO1xyXG4gIH1cclxuICBwcml2YXRlIGRlbGF5KHRpbWVvdXQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KFxyXG4gICAgICAocmVzb2x2ZSk6IFRpbWVvdXQgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lb3V0KVxyXG4gICAgKTtcclxuICB9XHJcbiAgXHJcbn1cclxuIl19