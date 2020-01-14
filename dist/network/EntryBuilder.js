"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class EntryBuilder {
    constructor(request) {
        this.request = request;
    }
    build() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let serverIPAddress = this.request.remoteAddress;
            const portPositionInString = serverIPAddress.lastIndexOf(':');
            if (portPositionInString !== -1) {
                serverIPAddress = serverIPAddress.substr(0, portPositionInString);
            }
            const timings = this.buildTimings();
            const time = Object.values(timings).reduce((acc, t) => (acc += Math.max(t, 0)));
            const entry = {
                startedDateTime: new Date(this.request.getWallTime(this.request.issueTime) * 1000).toJSON(),
                time,
                request: yield this.buildRequest(),
                response: yield this.buildResponse(),
                cache: {},
                timings,
                serverIPAddress: serverIPAddress.replace(/\[\]/g, ''),
                _priority: this.request.priority,
                _resourceType: this.request.resourceType,
                _websocket: this.buildWebSockets((_a = this.request.frames, (_a !== null && _a !== void 0 ? _a : [])))
            };
            if (this.request.connectionId !== '0') {
                entry.connection = this.request.connectionId;
            }
            return entry;
        });
    }
    getResponseBodySize() {
        if (this.request.statusCode === 304) {
            return 0;
        }
        if (!this.request.responseHeadersText) {
            return -1;
        }
        return this.request.transferSize - this.request.responseHeadersText.length;
    }
    getResponseCompression() {
        if (this.request.statusCode === 304 || this.request.statusCode === 206) {
            return;
        }
        if (!this.request.responseHeadersText) {
            return;
        }
        return this.request.resourceSize - this.getResponseBodySize();
    }
    toMilliseconds(time) {
        return time === -1 ? -1 : time * 1000;
    }
    buildRequest() {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = {
                method: this.request.requestMethod,
                url: this.buildRequestURL(this.request.url),
                httpVersion: this.request.requestHttpVersion,
                headers: this.request.requestHeaders,
                queryString: [...(_a = this.request.queryParameters, (_a !== null && _a !== void 0 ? _a : []))],
                cookies: this.buildCookies((_b = this.request.requestCookies, (_b !== null && _b !== void 0 ? _b : []))),
                headersSize: (_d = (_c = this.request.requestHeadersText) === null || _c === void 0 ? void 0 : _c.length, (_d !== null && _d !== void 0 ? _d : -1)),
                bodySize: yield this.requestBodySize()
            };
            const postData = yield this.buildPostData();
            if (postData) {
                res.postData = postData;
            }
            return res;
        });
    }
    buildResponse() {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                status: this.request.statusCode,
                statusText: this.request.statusText,
                httpVersion: this.request.responseHttpVersion(),
                headers: this.request.responseHeaders,
                cookies: this.buildCookies(this.request.responseCookies || []),
                content: yield this.buildContent(),
                redirectURL: (_a = this.request.responseHeaderValue('Location'), (_a !== null && _a !== void 0 ? _a : '')),
                headersSize: (_c = (_b = this.request.responseHeadersText) === null || _b === void 0 ? void 0 : _b.length, (_c !== null && _c !== void 0 ? _c : -1)),
                bodySize: this.getResponseBodySize(),
                _transferSize: this.request.transferSize
            };
        });
    }
    buildContent() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({ size: this.request.resourceSize, mimeType: this.request.mimeType || 'x-unknown' }, (yield this.request.contentData())), { compression: (_a = this.getResponseCompression(), (_a !== null && _a !== void 0 ? _a : undefined)) });
        });
    }
    buildTimings() {
        var _a, _b;
        const timing = this.request.timing;
        const issueTime = this.request.issueTime;
        const startTime = this.request.startTime;
        const result = {
            blocked: -1,
            dns: -1,
            ssl: -1,
            connect: -1,
            send: 0,
            wait: 0,
            receive: 0
        };
        const queuedTime = issueTime < startTime ? startTime - issueTime : -1;
        result.blocked = this.toMilliseconds(queuedTime);
        let highestTime = 0;
        if (timing) {
            const blockedStart = this.leastNonNegative([
                timing.dnsStart,
                timing.connectStart,
                timing.sendStart
            ]);
            if (blockedStart !== Infinity) {
                result.blocked += blockedStart;
            }
            const dnsStart = timing.dnsEnd >= 0 ? blockedStart : 0;
            const dnsEnd = timing.dnsEnd >= 0 ? timing.dnsEnd : -1;
            result.dns = dnsEnd - dnsStart;
            const sslStart = timing.sslEnd > 0 ? timing.sslStart : 0;
            const sslEnd = timing.sslEnd > 0 ? timing.sslEnd : -1;
            result.ssl = sslEnd - sslStart;
            const connectStart = timing.connectEnd >= 0
                ? this.leastNonNegative([dnsEnd, blockedStart])
                : 0;
            const connectEnd = timing.connectEnd >= 0 ? timing.connectEnd : -1;
            result.connect = connectEnd - connectStart;
            const sendStart = timing.sendEnd >= 0 ? Math.max(connectEnd, dnsEnd, blockedStart) : 0;
            const sendEnd = timing.sendEnd >= 0 ? timing.sendEnd : 0;
            result.send = sendEnd - sendStart;
            if (result.send < 0) {
                result.send = 0;
            }
            highestTime = Math.max(sendEnd, connectEnd, sslEnd, dnsEnd, blockedStart, 0);
        }
        else if (this.request.responseReceivedTime === -1) {
            result.blocked = this.request.endTime - issueTime;
            return result;
        }
        const requestTime = (_b = (_a = timing) === null || _a === void 0 ? void 0 : _a.requestTime, (_b !== null && _b !== void 0 ? _b : startTime));
        const waitStart = highestTime;
        const waitEnd = this.toMilliseconds(this.request.responseReceivedTime - requestTime);
        result.wait = waitEnd - waitStart;
        const receiveStart = waitEnd;
        const receiveEnd = this.toMilliseconds(this.request.endTime - requestTime);
        result.receive = Math.max(receiveEnd - receiveStart, 0);
        return result;
    }
    leastNonNegative(values) {
        const value = values.find((item) => item >= 0);
        return (value !== null && value !== void 0 ? value : -1);
    }
    buildPostData() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const postData = yield this.request.requestFormData();
            if (!postData) {
                return;
            }
            const res = {
                mimeType: (_a = this.request.requestContentType, (_a !== null && _a !== void 0 ? _a : '')),
                text: postData
            };
            const formParameters = yield this.request.formParameters();
            if (formParameters) {
                res.params = [...formParameters];
            }
            return res;
        });
    }
    buildRequestURL(url) {
        return url.split('#', 2)[0];
    }
    buildWebSockets(frames) {
        return frames.map(this.buildSocket.bind(this));
    }
    buildCookies(cookies) {
        return cookies.map(this.buildCookie.bind(this));
    }
    buildSocket(frame) {
        return {
            [frame.type]: frame.data,
            opcode: frame.opCode,
            mask: frame.mask
        };
    }
    buildCookie(cookie) {
        var _a;
        return {
            name: cookie.name,
            value: cookie.value,
            path: cookie.path,
            domain: cookie.domain,
            expires: (_a = cookie
                .expiresDate(new Date(this.request.getWallTime(this.request.startTime) * 1000))) === null || _a === void 0 ? void 0 : _a.toJSON(),
            httpOnly: cookie.httpOnly,
            secure: cookie.secure
        };
    }
    requestBodySize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const postData = yield this.request.requestFormData();
            if (!postData) {
                return 0;
            }
            return this.request.contentLength;
        });
    }
}
exports.EntryBuilder = EntryBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50cnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL25ldHdvcmsvRW50cnlCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFCQSxNQUFhLFlBQVk7SUFDdkIsWUFBNkIsT0FBdUI7UUFBdkIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7SUFBRyxDQUFDO0lBRTNDLEtBQUs7OztZQUNoQixJQUFJLGVBQWUsR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUV6RCxNQUFNLG9CQUFvQixHQUFXLGVBQWUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFdEUsSUFBSSxvQkFBb0IsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDL0IsZUFBZSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7YUFDbkU7WUFFRCxNQUFNLE9BQU8sR0FBWSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFN0MsTUFBTSxJQUFJLEdBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQzdDLENBQUMsR0FBVyxFQUFFLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDcEQsQ0FBQztZQUVGLE1BQU0sS0FBSyxHQUFRO2dCQUNqQixlQUFlLEVBQUUsSUFBSSxJQUFJLENBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUN4RCxDQUFDLE1BQU0sRUFBRTtnQkFDVixJQUFJO2dCQUNKLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xDLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3BDLEtBQUssRUFB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QUUsTUFBTSxDQUFDLE1BQU07WUFDckIsT0FBTyxRQUFFLE1BQU07aUJBQ1osV0FBVyxDQUNWLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQ2xFLDBDQUNDLE1BQU0sRUFBRTtZQUNaLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUN6QixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07U0FDdEIsQ0FBQztJQUNKLENBQUM7SUFFYSxlQUFlOztZQUMzQixNQUFNLFFBQVEsR0FBdUIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRTFFLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IsT0FBTyxDQUFDLENBQUM7YUFDVjtZQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDcEMsQ0FBQztLQUFBO0NBQ0Y7QUE5UUQsb0NBOFFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV0d29ya1JlcXVlc3QsIFdlYlNvY2tldCB9IGZyb20gJy4vTmV0d29ya1JlcXVlc3QnO1xyXG5pbXBvcnQge1xyXG4gIENvbnRlbnQsXHJcbiAgQ29va2llLFxyXG4gIEVudHJ5LFxyXG4gIFBhcmFtLFxyXG4gIFBvc3REYXRhLFxyXG4gIFJlcXVlc3QsXHJcbiAgUmVzcG9uc2UsXHJcbiAgVGltaW5nc1xyXG59IGZyb20gJ2hhci1mb3JtYXQnO1xyXG5pbXBvcnQgUHJvdG9jb2wgZnJvbSAnZGV2dG9vbHMtcHJvdG9jb2wnO1xyXG5pbXBvcnQgeyBOZXR3b3JrQ29va2llIH0gZnJvbSAnLi9OZXR3b3JrQ29va2llJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV3NhcldlYlNvY2tldEZyYW1lIHtcclxuICByZXF1ZXN0Pzogc3RyaW5nO1xyXG4gIHJlc3BvbnNlPzogc3RyaW5nO1xyXG4gIG9wY29kZTogbnVtYmVyO1xyXG4gIG1hc2s6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBFbnRyeUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmVxdWVzdDogTmV0d29ya1JlcXVlc3QpIHt9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBidWlsZCgpOiBQcm9taXNlPEVudHJ5PiB7XHJcbiAgICBsZXQgc2VydmVySVBBZGRyZXNzOiBzdHJpbmcgPSB0aGlzLnJlcXVlc3QucmVtb3RlQWRkcmVzcztcclxuXHJcbiAgICBjb25zdCBwb3J0UG9zaXRpb25JblN0cmluZzogbnVtYmVyID0gc2VydmVySVBBZGRyZXNzLmxhc3RJbmRleE9mKCc6Jyk7XHJcblxyXG4gICAgaWYgKHBvcnRQb3NpdGlvbkluU3RyaW5nICE9PSAtMSkge1xyXG4gICAgICBzZXJ2ZXJJUEFkZHJlc3MgPSBzZXJ2ZXJJUEFkZHJlc3Muc3Vic3RyKDAsIHBvcnRQb3NpdGlvbkluU3RyaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aW1pbmdzOiBUaW1pbmdzID0gdGhpcy5idWlsZFRpbWluZ3MoKTtcclxuXHJcbiAgICBjb25zdCB0aW1lOiBhbnkgPSBPYmplY3QudmFsdWVzKHRpbWluZ3MpLnJlZHVjZShcclxuICAgICAgKGFjYzogbnVtYmVyLCB0OiBudW1iZXIpID0+IChhY2MgKz0gTWF0aC5tYXgodCwgMCkpXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IGVudHJ5OiBhbnkgPSB7XHJcbiAgICAgIHN0YXJ0ZWREYXRlVGltZTogbmV3IERhdGUoXHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0LmdldFdhbGxUaW1lKHRoaXMucmVxdWVzdC5pc3N1ZVRpbWUpICogMTAwMFxyXG4gICAgICApLnRvSlNPTigpLFxyXG4gICAgICB0aW1lLFxyXG4gICAgICByZXF1ZXN0OiBhd2FpdCB0aGlzLmJ1aWxkUmVxdWVzdCgpLFxyXG4gICAgICByZXNwb25zZTogYXdhaXQgdGhpcy5idWlsZFJlc3BvbnNlKCksXHJcbiAgICAgIGNhY2hlOiB7fSxcclxuICAgICAgdGltaW5ncyxcclxuICAgICAgc2VydmVySVBBZGRyZXNzOiBzZXJ2ZXJJUEFkZHJlc3MucmVwbGFjZSgvXFxbXFxdL2csICcnKSxcclxuICAgICAgX3ByaW9yaXR5OiB0aGlzLnJlcXVlc3QucHJpb3JpdHksXHJcbiAgICAgIF9yZXNvdXJjZVR5cGU6IHRoaXMucmVxdWVzdC5yZXNvdXJjZVR5cGUsXHJcbiAgICAgIF93ZWJzb2NrZXQ6IHRoaXMuYnVpbGRXZWJTb2NrZXRzKHRoaXMucmVxdWVzdC5mcmFtZXMgPz8gW10pXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLnJlcXVlc3QuY29ubmVjdGlvbklkICE9PSAnMCcpIHtcclxuICAgICAgZW50cnkuY29ubmVjdGlvbiA9IHRoaXMucmVxdWVzdC5jb25uZWN0aW9uSWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVudHJ5O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRSZXNwb25zZUJvZHlTaXplKCk6IG51bWJlciB7XHJcbiAgICBpZiAodGhpcy5yZXF1ZXN0LnN0YXR1c0NvZGUgPT09IDMwNCkge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMucmVxdWVzdC5yZXNwb25zZUhlYWRlcnNUZXh0KSB7XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0LnRyYW5zZmVyU2l6ZSAtIHRoaXMucmVxdWVzdC5yZXNwb25zZUhlYWRlcnNUZXh0Lmxlbmd0aDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmVzcG9uc2VDb21wcmVzc2lvbigpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgaWYgKHRoaXMucmVxdWVzdC5zdGF0dXNDb2RlID09PSAzMDQgfHwgdGhpcy5yZXF1ZXN0LnN0YXR1c0NvZGUgPT09IDIwNikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoIXRoaXMucmVxdWVzdC5yZXNwb25zZUhlYWRlcnNUZXh0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0LnJlc291cmNlU2l6ZSAtIHRoaXMuZ2V0UmVzcG9uc2VCb2R5U2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB0b01pbGxpc2Vjb25kcyh0aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRpbWUgPT09IC0xID8gLTEgOiB0aW1lICogMTAwMDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgYnVpbGRSZXF1ZXN0KCk6IFByb21pc2U8UmVxdWVzdD4ge1xyXG4gICAgY29uc3QgcmVzOiBSZXF1ZXN0ID0ge1xyXG4gICAgICBtZXRob2Q6IHRoaXMucmVxdWVzdC5yZXF1ZXN0TWV0aG9kLFxyXG4gICAgICB1cmw6IHRoaXMuYnVpbGRSZXF1ZXN0VVJMKHRoaXMucmVxdWVzdC51cmwpLFxyXG4gICAgICBodHRwVmVyc2lvbjogdGhpcy5yZXF1ZXN0LnJlcXVlc3RIdHRwVmVyc2lvbixcclxuICAgICAgaGVhZGVyczogdGhpcy5yZXF1ZXN0LnJlcXVlc3RIZWFkZXJzLFxyXG4gICAgICBxdWVyeVN0cmluZzogWy4uLih0aGlzLnJlcXVlc3QucXVlcnlQYXJhbWV0ZXJzID8/IFtdKV0sXHJcbiAgICAgIGNvb2tpZXM6IHRoaXMuYnVpbGRDb29raWVzKHRoaXMucmVxdWVzdC5yZXF1ZXN0Q29va2llcyA/PyBbXSksXHJcbiAgICAgIGhlYWRlcnNTaXplOiB0aGlzLnJlcXVlc3QucmVxdWVzdEhlYWRlcnNUZXh0Py5sZW5ndGggPz8gLTEsXHJcbiAgICAgIGJvZHlTaXplOiBhd2FpdCB0aGlzLnJlcXVlc3RCb2R5U2l6ZSgpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHBvc3REYXRhOiBQb3N0RGF0YSA9IGF3YWl0IHRoaXMuYnVpbGRQb3N0RGF0YSgpO1xyXG5cclxuICAgIGlmIChwb3N0RGF0YSkge1xyXG4gICAgICByZXMucG9zdERhdGEgPSBwb3N0RGF0YTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyBidWlsZFJlc3BvbnNlKCk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogdGhpcy5yZXF1ZXN0LnN0YXR1c0NvZGUsXHJcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMucmVxdWVzdC5zdGF0dXNUZXh0LFxyXG4gICAgICBodHRwVmVyc2lvbjogdGhpcy5yZXF1ZXN0LnJlc3BvbnNlSHR0cFZlcnNpb24oKSxcclxuICAgICAgaGVhZGVyczogdGhpcy5yZXF1ZXN0LnJlc3BvbnNlSGVhZGVycyxcclxuICAgICAgY29va2llczogdGhpcy5idWlsZENvb2tpZXModGhpcy5yZXF1ZXN0LnJlc3BvbnNlQ29va2llcyB8fCBbXSksXHJcbiAgICAgIGNvbnRlbnQ6IGF3YWl0IHRoaXMuYnVpbGRDb250ZW50KCksXHJcbiAgICAgIHJlZGlyZWN0VVJMOiB0aGlzLnJlcXVlc3QucmVzcG9uc2VIZWFkZXJWYWx1ZSgnTG9jYXRpb24nKSA/PyAnJyxcclxuICAgICAgaGVhZGVyc1NpemU6IHRoaXMucmVxdWVzdC5yZXNwb25zZUhlYWRlcnNUZXh0Py5sZW5ndGggPz8gLTEsXHJcbiAgICAgIGJvZHlTaXplOiB0aGlzLmdldFJlc3BvbnNlQm9keVNpemUoKSxcclxuICAgICAgX3RyYW5zZmVyU2l6ZTogdGhpcy5yZXF1ZXN0LnRyYW5zZmVyU2l6ZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgYnVpbGRDb250ZW50KCk6IFByb21pc2U8Q29udGVudD4ge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2l6ZTogdGhpcy5yZXF1ZXN0LnJlc291cmNlU2l6ZSxcclxuICAgICAgbWltZVR5cGU6IHRoaXMucmVxdWVzdC5taW1lVHlwZSB8fCAneC11bmtub3duJyxcclxuICAgICAgLi4uKGF3YWl0IHRoaXMucmVxdWVzdC5jb250ZW50RGF0YSgpKSxcclxuICAgICAgY29tcHJlc3Npb246IHRoaXMuZ2V0UmVzcG9uc2VDb21wcmVzc2lvbigpID8/IHVuZGVmaW5lZFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRUaW1pbmdzKCk6IFRpbWluZ3Mge1xyXG4gICAgY29uc3QgdGltaW5nOiBQcm90b2NvbC5OZXR3b3JrLlJlc291cmNlVGltaW5nID0gdGhpcy5yZXF1ZXN0LnRpbWluZztcclxuICAgIGNvbnN0IGlzc3VlVGltZTogbnVtYmVyID0gdGhpcy5yZXF1ZXN0Lmlzc3VlVGltZTtcclxuICAgIGNvbnN0IHN0YXJ0VGltZTogbnVtYmVyID0gdGhpcy5yZXF1ZXN0LnN0YXJ0VGltZTtcclxuXHJcbiAgICBjb25zdCByZXN1bHQ6IFRpbWluZ3MgPSB7XHJcbiAgICAgIGJsb2NrZWQ6IC0xLFxyXG4gICAgICBkbnM6IC0xLFxyXG4gICAgICBzc2w6IC0xLFxyXG4gICAgICBjb25uZWN0OiAtMSxcclxuICAgICAgc2VuZDogMCxcclxuICAgICAgd2FpdDogMCxcclxuICAgICAgcmVjZWl2ZTogMFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBxdWV1ZWRUaW1lOiBudW1iZXIgPVxyXG4gICAgICBpc3N1ZVRpbWUgPCBzdGFydFRpbWUgPyBzdGFydFRpbWUgLSBpc3N1ZVRpbWUgOiAtMTtcclxuICAgIHJlc3VsdC5ibG9ja2VkID0gdGhpcy50b01pbGxpc2Vjb25kcyhxdWV1ZWRUaW1lKTtcclxuXHJcbiAgICBsZXQgaGlnaGVzdFRpbWUgPSAwO1xyXG5cclxuICAgIGlmICh0aW1pbmcpIHtcclxuICAgICAgY29uc3QgYmxvY2tlZFN0YXJ0ID0gdGhpcy5sZWFzdE5vbk5lZ2F0aXZlKFtcclxuICAgICAgICB0aW1pbmcuZG5zU3RhcnQsXHJcbiAgICAgICAgdGltaW5nLmNvbm5lY3RTdGFydCxcclxuICAgICAgICB0aW1pbmcuc2VuZFN0YXJ0XHJcbiAgICAgIF0pO1xyXG4gICAgICBpZiAoYmxvY2tlZFN0YXJ0ICE9PSBJbmZpbml0eSkge1xyXG4gICAgICAgIHJlc3VsdC5ibG9ja2VkICs9IGJsb2NrZWRTdGFydDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZG5zU3RhcnQ6IGFueSA9IHRpbWluZy5kbnNFbmQgPj0gMCA/IGJsb2NrZWRTdGFydCA6IDA7XHJcbiAgICAgIGNvbnN0IGRuc0VuZDogbnVtYmVyID0gdGltaW5nLmRuc0VuZCA+PSAwID8gdGltaW5nLmRuc0VuZCA6IC0xO1xyXG4gICAgICByZXN1bHQuZG5zID0gZG5zRW5kIC0gZG5zU3RhcnQ7XHJcblxyXG4gICAgICBjb25zdCBzc2xTdGFydDogbnVtYmVyID0gdGltaW5nLnNzbEVuZCA+IDAgPyB0aW1pbmcuc3NsU3RhcnQgOiAwO1xyXG4gICAgICBjb25zdCBzc2xFbmQ6IG51bWJlciA9IHRpbWluZy5zc2xFbmQgPiAwID8gdGltaW5nLnNzbEVuZCA6IC0xO1xyXG4gICAgICByZXN1bHQuc3NsID0gc3NsRW5kIC0gc3NsU3RhcnQ7XHJcblxyXG4gICAgICBjb25zdCBjb25uZWN0U3RhcnQ6IG51bWJlciA9XHJcbiAgICAgICAgdGltaW5nLmNvbm5lY3RFbmQgPj0gMFxyXG4gICAgICAgICAgPyB0aGlzLmxlYXN0Tm9uTmVnYXRpdmUoW2Ruc0VuZCwgYmxvY2tlZFN0YXJ0XSlcclxuICAgICAgICAgIDogMDtcclxuICAgICAgY29uc3QgY29ubmVjdEVuZDogbnVtYmVyID1cclxuICAgICAgICB0aW1pbmcuY29ubmVjdEVuZCA+PSAwID8gdGltaW5nLmNvbm5lY3RFbmQgOiAtMTtcclxuICAgICAgcmVzdWx0LmNvbm5lY3QgPSBjb25uZWN0RW5kIC0gY29ubmVjdFN0YXJ0O1xyXG5cclxuICAgICAgY29uc3Qgc2VuZFN0YXJ0OiBudW1iZXIgPVxyXG4gICAgICAgIHRpbWluZy5zZW5kRW5kID49IDAgPyBNYXRoLm1heChjb25uZWN0RW5kLCBkbnNFbmQsIGJsb2NrZWRTdGFydCkgOiAwO1xyXG4gICAgICBjb25zdCBzZW5kRW5kOiBudW1iZXIgPSB0aW1pbmcuc2VuZEVuZCA+PSAwID8gdGltaW5nLnNlbmRFbmQgOiAwO1xyXG4gICAgICByZXN1bHQuc2VuZCA9IHNlbmRFbmQgLSBzZW5kU3RhcnQ7XHJcblxyXG4gICAgICBpZiAocmVzdWx0LnNlbmQgPCAwKSB7XHJcbiAgICAgICAgcmVzdWx0LnNlbmQgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBoaWdoZXN0VGltZSA9IE1hdGgubWF4KFxyXG4gICAgICAgIHNlbmRFbmQsXHJcbiAgICAgICAgY29ubmVjdEVuZCxcclxuICAgICAgICBzc2xFbmQsXHJcbiAgICAgICAgZG5zRW5kLFxyXG4gICAgICAgIGJsb2NrZWRTdGFydCxcclxuICAgICAgICAwXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMucmVxdWVzdC5yZXNwb25zZVJlY2VpdmVkVGltZSA9PT0gLTEpIHtcclxuICAgICAgcmVzdWx0LmJsb2NrZWQgPSB0aGlzLnJlcXVlc3QuZW5kVGltZSAtIGlzc3VlVGltZTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVxdWVzdFRpbWU6IG51bWJlciA9IHRpbWluZz8ucmVxdWVzdFRpbWUgPz8gc3RhcnRUaW1lO1xyXG4gICAgY29uc3Qgd2FpdFN0YXJ0OiBudW1iZXIgPSBoaWdoZXN0VGltZTtcclxuICAgIGNvbnN0IHdhaXRFbmQ6IG51bWJlciA9IHRoaXMudG9NaWxsaXNlY29uZHMoXHJcbiAgICAgIHRoaXMucmVxdWVzdC5yZXNwb25zZVJlY2VpdmVkVGltZSAtIHJlcXVlc3RUaW1lXHJcbiAgICApO1xyXG4gICAgcmVzdWx0LndhaXQgPSB3YWl0RW5kIC0gd2FpdFN0YXJ0O1xyXG5cclxuICAgIGNvbnN0IHJlY2VpdmVTdGFydDogbnVtYmVyID0gd2FpdEVuZDtcclxuICAgIGNvbnN0IHJlY2VpdmVFbmQ6IG51bWJlciA9IHRoaXMudG9NaWxsaXNlY29uZHMoXHJcbiAgICAgIHRoaXMucmVxdWVzdC5lbmRUaW1lIC0gcmVxdWVzdFRpbWVcclxuICAgICk7XHJcbiAgICByZXN1bHQucmVjZWl2ZSA9IE1hdGgubWF4KHJlY2VpdmVFbmQgLSByZWNlaXZlU3RhcnQsIDApO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxlYXN0Tm9uTmVnYXRpdmUodmFsdWVzOiBudW1iZXJbXSk6IG51bWJlciB7XHJcbiAgICBjb25zdCB2YWx1ZTogbnVtYmVyID0gdmFsdWVzLmZpbmQoKGl0ZW06IG51bWJlcikgPT4gaXRlbSA+PSAwKTtcclxuXHJcbiAgICByZXR1cm4gdmFsdWUgPz8gLTE7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFzeW5jIGJ1aWxkUG9zdERhdGEoKTogUHJvbWlzZTxQb3N0RGF0YT4ge1xyXG4gICAgY29uc3QgcG9zdERhdGE6IHN0cmluZyA9IGF3YWl0IHRoaXMucmVxdWVzdC5yZXF1ZXN0Rm9ybURhdGEoKTtcclxuXHJcbiAgICBpZiAoIXBvc3REYXRhKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXM6IFBhcnRpYWw8UG9zdERhdGE+ID0ge1xyXG4gICAgICBtaW1lVHlwZTogdGhpcy5yZXF1ZXN0LnJlcXVlc3RDb250ZW50VHlwZSA/PyAnJyxcclxuICAgICAgdGV4dDogcG9zdERhdGFcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZm9ybVBhcmFtZXRlcnM6IFBhcmFtW10gPSBhd2FpdCB0aGlzLnJlcXVlc3QuZm9ybVBhcmFtZXRlcnMoKTtcclxuXHJcbiAgICBpZiAoZm9ybVBhcmFtZXRlcnMpIHtcclxuICAgICAgcmVzLnBhcmFtcyA9IFsuLi5mb3JtUGFyYW1ldGVyc107XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlcyBhcyBQb3N0RGF0YTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRSZXF1ZXN0VVJMKHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB1cmwuc3BsaXQoJyMnLCAyKVswXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYnVpbGRXZWJTb2NrZXRzKGZyYW1lczogV2ViU29ja2V0W10pOiBXc2FyV2ViU29ja2V0RnJhbWVbXSB7XHJcbiAgICByZXR1cm4gZnJhbWVzLm1hcCh0aGlzLmJ1aWxkU29ja2V0LmJpbmQodGhpcykpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZENvb2tpZXMoY29va2llczogTmV0d29ya0Nvb2tpZVtdKTogQ29va2llW10ge1xyXG4gICAgcmV0dXJuIGNvb2tpZXMubWFwKHRoaXMuYnVpbGRDb29raWUuYmluZCh0aGlzKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGJ1aWxkU29ja2V0KGZyYW1lOiBXZWJTb2NrZXQpOiBXc2FyV2ViU29ja2V0RnJhbWUge1xyXG4gICAgcmV0dXJuICh7XHJcbiAgICAgIFtmcmFtZS50eXBlXTogZnJhbWUuZGF0YSxcclxuICAgICAgb3Bjb2RlOiBmcmFtZS5vcENvZGUsXHJcbiAgICAgIG1hc2s6IGZyYW1lLm1hc2tcclxuICAgIH0gYXMgdW5rbm93bikgYXMgV3NhcldlYlNvY2tldEZyYW1lO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZENvb2tpZShjb29raWU6IE5ldHdvcmtDb29raWUpOiBDb29raWUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogY29va2llLm5hbWUsXHJcbiAgICAgIHZhbHVlOiBjb29raWUudmFsdWUsXHJcbiAgICAgIHBhdGg6IGNvb2tpZS5wYXRoLFxyXG4gICAgICBkb21haW46IGNvb2tpZS5kb21haW4sXHJcbiAgICAgIGV4cGlyZXM6IGNvb2tpZVxyXG4gICAgICAgIC5leHBpcmVzRGF0ZShcclxuICAgICAgICAgIG5ldyBEYXRlKHRoaXMucmVxdWVzdC5nZXRXYWxsVGltZSh0aGlzLnJlcXVlc3Quc3RhcnRUaW1lKSAqIDEwMDApXHJcbiAgICAgICAgKVxyXG4gICAgICAgID8udG9KU09OKCksXHJcbiAgICAgIGh0dHBPbmx5OiBjb29raWUuaHR0cE9ubHksXHJcbiAgICAgIHNlY3VyZTogY29va2llLnNlY3VyZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVxdWVzdEJvZHlTaXplKCk6IFByb21pc2U8bnVtYmVyPiB7XHJcbiAgICBjb25zdCBwb3N0RGF0YTogc3RyaW5nIHwgdW5kZWZpbmVkID0gYXdhaXQgdGhpcy5yZXF1ZXN0LnJlcXVlc3RGb3JtRGF0YSgpO1xyXG5cclxuICAgIGlmICghcG9zdERhdGEpIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdC5jb250ZW50TGVuZ3RoO1xyXG4gIH1cclxufVxyXG4iXX0=