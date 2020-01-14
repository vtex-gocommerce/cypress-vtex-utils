"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const url_1 = require("url");
const CookieParser_1 = require("./CookieParser");
var WebSocketFrameType;
(function (WebSocketFrameType) {
    WebSocketFrameType["Request"] = "request";
    WebSocketFrameType["Response"] = "response";
    WebSocketFrameType["Error"] = "error";
})(WebSocketFrameType = exports.WebSocketFrameType || (exports.WebSocketFrameType = {}));
class NetworkRequest {
    constructor(_requestId, url, documentURL, frameId = '', loaderId, initiator, network) {
        this._requestId = _requestId;
        this.documentURL = documentURL;
        this.frameId = frameId;
        this.loaderId = loaderId;
        this.initiator = initiator;
        this.network = network;
        this._wallIssueTime = -1;
        this._requestHeaderValues = new Map();
        this._responseHeaderValues = new Map();
        this._requestFormDataPromise = Promise.resolve(undefined);
        this._hasExtraResponseInfo = false;
        this._hasExtraRequestInfo = false;
        this._connectionId = '0';
        this._protocol = '';
        this._requestTime = 0;
        this._requestMethod = '';
        this._statusText = '';
        this._remoteAddress = '';
        this._startTime = -1;
        this._issueTime = -1;
        this._endTime = -1;
        this._responseReceivedTime = -1;
        this._resourceSize = 0;
        this._transferSize = 0;
        this._resourceType = 'Other';
        this._requestHeaders = [];
        this._requestHeadersText = '';
        this._connectionReused = false;
        this._responseHeaders = [];
        this._responseHeadersText = '';
        this._frames = [];
        this._statusCode = 0;
        this.setUrl(url);
    }
    set signedExchangeInfo(info) {
        this._signedExchangeInfo = info;
    }
    get hasExtraResponseInfo() {
        return this._hasExtraResponseInfo;
    }
    set hasExtraResponseInfo(value) {
        this._hasExtraResponseInfo = value;
    }
    get hasExtraRequestInfo() {
        return this._hasExtraRequestInfo;
    }
    set hasExtraRequestInfo(value) {
        this._hasExtraRequestInfo = value;
    }
    get connectionId() {
        return this._connectionId;
    }
    set connectionId(value) {
        this._connectionId = value;
    }
    get protocol() {
        return this._protocol;
    }
    set protocol(value) {
        this._protocol = (value !== null && value !== void 0 ? value : '');
    }
    get requestTime() {
        return this._requestTime;
    }
    set requestTime(value) {
        this._requestTime = (value !== null && value !== void 0 ? value : 0);
    }
    get requestMethod() {
        return this._requestMethod;
    }
    set requestMethod(value) {
        this._requestMethod = (value !== null && value !== void 0 ? value : '');
    }
    get statusText() {
        return this._statusText;
    }
    set statusText(value) {
        this._statusText = (value !== null && value !== void 0 ? value : '');
    }
    get parsedURL() {
        return this._parsedURL;
    }
    get url() {
        return this._url;
    }
    get remoteAddress() {
        return this._remoteAddress;
    }
    get startTime() {
        return this._startTime || -1;
    }
    get issueTime() {
        return this._issueTime;
    }
    get endTime() {
        return this._endTime || -1;
    }
    set endTime(x) {
        if (this.timing && this.timing.requestTime) {
            this._endTime = Math.max(x, this.responseReceivedTime);
        }
        else {
            this._endTime = x;
            if (this._responseReceivedTime > x) {
                this._responseReceivedTime = x;
            }
        }
    }
    get responseReceivedTime() {
        return this._responseReceivedTime || -1;
    }
    set responseReceivedTime(value) {
        this._responseReceivedTime = value;
    }
    get resourceSize() {
        return this._resourceSize || 0;
    }
    set resourceSize(value) {
        this._resourceSize = (value !== null && value !== void 0 ? value : 0);
    }
    get transferSize() {
        return this._transferSize || 0;
    }
    set transferSize(value) {
        this._transferSize = (value !== null && value !== void 0 ? value : 0);
    }
    get timing() {
        return this._timing;
    }
    set timing(timingInfo) {
        if (!timingInfo) {
            return;
        }
        this._startTime = timingInfo.requestTime;
        const headersReceivedTime = timingInfo.requestTime + timingInfo.receiveHeadersEnd / 1000.0;
        if ((this._responseReceivedTime || -1) < 0 ||
            this._responseReceivedTime > headersReceivedTime) {
            this._responseReceivedTime = headersReceivedTime;
        }
        if (this._startTime > this._responseReceivedTime) {
            this._responseReceivedTime = this._startTime;
        }
        this._timing = timingInfo;
    }
    get mimeType() {
        return this._mimeType;
    }
    set mimeType(value) {
        this._mimeType = value;
    }
    get resourceType() {
        return this._resourceType;
    }
    set resourceType(resourceType) {
        this._resourceType = (resourceType !== null && resourceType !== void 0 ? resourceType : 'Other');
    }
    get redirectSource() {
        return this._redirectSource;
    }
    set redirectSource(originatingRequest) {
        this._redirectSource = originatingRequest;
    }
    get requestHeaders() {
        return this._requestHeaders;
    }
    set requestHeaders(headers) {
        this._requestHeaders = headers;
        this._requestHeaderValues.clear();
        delete this._requestCookies;
    }
    get requestCookies() {
        if (!this._requestCookies) {
            const cookie = this.requestHeaderValue('Cookie');
            this._requestCookies = new CookieParser_1.CookieParser().parseCookie(cookie);
        }
        return this._requestCookies;
    }
    get contentLength() {
        const contentLength = this.requestHeaderValue('Content-Length');
        return isNaN(+contentLength) ? 0 : parseInt(contentLength, 10);
    }
    get requestHeadersText() {
        return this._requestHeadersText;
    }
    set requestHeadersText(text) {
        this._requestHeadersText = text;
    }
    get connectionReused() {
        return this._connectionReused;
    }
    set connectionReused(value) {
        this._connectionReused = value;
    }
    get responseHeaders() {
        return this._responseHeaders || [];
    }
    set responseHeaders(value) {
        this._responseHeaders = value;
        delete this._responseCookies;
        this._responseHeaderValues.clear();
    }
    get responseHeadersText() {
        return this._responseHeadersText;
    }
    set responseHeadersText(value) {
        this._responseHeadersText = value;
    }
    get responseCookies() {
        if (!this._responseCookies) {
            const cookie = this.responseHeaderValue('Set-Cookie');
            this._requestCookies = new CookieParser_1.CookieParser().parseSetCookie(cookie);
        }
        return this._responseCookies;
    }
    get queryString() {
        if (this._queryString !== undefined) {
            return this._queryString;
        }
        let queryString = null;
        const questionMarkPosition = this.url.indexOf('?');
        if (questionMarkPosition !== -1) {
            queryString = this.url.substring(questionMarkPosition + 1);
            const hashSignPosition = queryString.indexOf('#');
            if (hashSignPosition !== -1) {
                queryString = queryString.substring(0, hashSignPosition);
            }
        }
        this._queryString = queryString;
        return this._queryString;
    }
    get initialPriority() {
        return this._initialPriority;
    }
    set initialPriority(priority) {
        this._initialPriority = priority;
    }
    get frames() {
        return this._frames;
    }
    get statusCode() {
        return this._statusCode;
    }
    set statusCode(value) {
        this._statusCode = value;
    }
    get requestId() {
        return this._requestId;
    }
    get requestHttpVersion() {
        if (this.requestHeadersText) {
            const firstLine = this.requestHeadersText.split(/\r\n/)[0];
            const match = firstLine.match(/(HTTP\/\d+\.\d+)$/);
            return match ? match[1] : 'HTTP/0.9';
        }
        const version = this.requestHeaderValue('version') || this.requestHeaderValue(':version');
        if (version) {
            return version;
        }
        return this.getFilteredProtocolName();
    }
    get queryParameters() {
        if (this._parsedQueryParameters) {
            return this._parsedQueryParameters;
        }
        if (!this.queryString) {
            return null;
        }
        this._parsedQueryParameters = this.parseParameters(this.queryString);
        return this._parsedQueryParameters;
    }
    get requestContentType() {
        return this.requestHeaderValue('Content-Type');
    }
    get priority() {
        return this._currentPriority || this._initialPriority || null;
    }
    set priority(priority) {
        this._currentPriority = priority;
    }
    static escapeCharacters(str, chars = '^[]{}()\\\\.$*+?|') {
        let foundChar = false;
        const length = chars.length;
        for (let i = 0; i < length; ++i) {
            if (str.indexOf(chars.charAt(i)) !== -1) {
                foundChar = true;
                break;
            }
        }
        if (!foundChar) {
            return str;
        }
        let result = '';
        for (let j = 0; j < str.length; ++j) {
            if (chars.indexOf(str.charAt(j)) !== -1) {
                result += '\\';
            }
            result += str.charAt(j);
        }
        return result;
    }
    setUrl(value) {
        if (this._url === value) {
            return;
        }
        this._url = value;
        this._parsedURL = url_1.parse(value);
        delete this._queryString;
        delete this._parsedQueryParameters;
    }
    setRemoteAddress(ip, port) {
        this._remoteAddress = `${ip}:${port}`;
    }
    setIssueTime(monotonicTime, wallTime) {
        this._issueTime = monotonicTime;
        this._wallIssueTime = wallTime;
        this._startTime = monotonicTime;
    }
    increaseTransferSize(value) {
        this._transferSize = (this._transferSize || 0) + value;
    }
    requestFormData() {
        try {
            // eslint-disable-next-line @typescript-eslint/tslint/config
            if (!this._requestFormDataPromise) {
                this._requestFormDataPromise = this.network
                    .getRequestPostData({ requestId: this.requestId })
                    .then(({ postData }) => postData);
            }
            return this._requestFormDataPromise;
        }
        catch (e) { }
    }
    setRequestFormData(hasData, data) {
        this._requestFormDataPromise =
            hasData && data === null ? null : Promise.resolve(data);
        this._formParametersPromise = null;
    }
    _parseFormParameters() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if ((_a = this.requestContentType) === null || _a === void 0 ? void 0 : _a.match(/^application\/x-www-form-urlencoded\s*(;.*)?$/i)) {
                const formUrlencoded = yield this.requestFormData();
                if (!formUrlencoded) {
                    return;
                }
                return this.parseParameters(formUrlencoded);
            }
            const multipartDetails = this.requestContentType.match(/^multipart\/form-data\s*;\s*boundary\s*=\s*(\S+)\s*$/);
            if (!multipartDetails) {
                return;
            }
            const boundary = multipartDetails[1];
            if (!boundary) {
                return;
            }
            const formData = yield this.requestFormData();
            if (!formData) {
                return;
            }
            return this.parseMultipartFormDataParameters(formData, boundary);
        });
    }
    getWallTime(monotonicTime) {
        return this._wallIssueTime
            ? this._wallIssueTime - this._issueTime + monotonicTime
            : monotonicTime;
    }
    formParameters() {
        // eslint-disable-next-line @typescript-eslint/tslint/config
        if (!this._formParametersPromise) {
            this._formParametersPromise = this._parseFormParameters();
        }
        return this._formParametersPromise;
    }
    responseHttpVersion() {
        if (this._responseHeadersText) {
            const firstLine = this._responseHeadersText.split(/\r\n/)[0];
            const match = firstLine.match(/^(HTTP\/\d+\.\d+)/);
            return match ? match[1] : 'HTTP/0.9';
        }
        const version = this.responseHeaderValue('version') ||
            this.responseHeaderValue(':version');
        if (version) {
            return version;
        }
        return this.getFilteredProtocolName();
    }
    contentData() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this._contentData) {
                return this._contentData;
            }
            if (this.resourceType === 'WebSocket') {
                return {
                    error: 'Content for WebSockets is currently not supported'
                };
            }
            try {
                const response = yield this.network.getResponseBody({ requestId: this.requestId });
                this._contentData = {
                    text: response.body,
                    encoding: response.base64Encoded ? 'base64' : undefined
                };
            }
            catch (e) {
                this._contentData = { error: e.message };
            }
            return this._contentData;
        });
    }
    addProtocolFrameError(errorMessage, time) {
        this.addFrame({
            type: WebSocketFrameType.Error,
            data: errorMessage,
            time,
            opCode: -1,
            mask: false
        });
    }
    addProtocolFrame(response, time, sent) {
        const type = sent
            ? WebSocketFrameType.Request
            : WebSocketFrameType.Response;
        this.addFrame({
            type,
            data: response.payloadData,
            time,
            opCode: response.opcode,
            mask: response.mask
        });
    }
    markAsRedirect(redirectCount) {
        this._requestId = `${this.requestId}:redirected.${redirectCount}`;
    }
    addExtraRequestInfo(extraRequestInfo) {
        this.requestHeaders = extraRequestInfo.requestHeaders;
        this._hasExtraRequestInfo = true;
        this.requestHeadersText = '';
    }
    addExtraResponseInfo(extraResponseInfo) {
        this.responseHeaders = extraResponseInfo.responseHeaders;
        if (extraResponseInfo.responseHeadersText) {
            this.responseHeadersText = extraResponseInfo.responseHeadersText;
        }
        else {
            let requestHeadersText = `${this._requestMethod} ${this.parsedURL.path}`;
            if (this.parsedURL.query) {
                requestHeadersText += `?${this.parsedURL.query}`;
            }
            requestHeadersText += ` HTTP/1.1\r\n`;
            for (const { name, value } of this.requestHeaders) {
                requestHeadersText += `${name}: ${value}\r\n`;
            }
            this.requestHeadersText = requestHeadersText;
        }
        this._hasExtraResponseInfo = true;
    }
    responseHeaderValue(headerName) {
        if (!this._responseHeaderValues.has(headerName)) {
            this._responseHeaderValues.set(headerName, this.computeHeaderValue(this.responseHeaders, headerName));
        }
        return this._responseHeaderValues.get(headerName);
    }
    parseMultipartFormDataParameters(data, boundary) {
        const sanitizedBoundary = NetworkRequest.escapeCharacters(boundary);
        const keyValuePattern = new RegExp(
        // Header with an optional file name.
        '^\\r\\ncontent-disposition\\s*:\\s*form-data\\s*;\\s*name="([^"]*)"(?:\\s*;\\s*filename="([^"]*)")?' +
            // Optional secondary header with the content type.
            '(?:\\r\\ncontent-type\\s*:\\s*([^\\r\\n]*))?' +
            // Padding.
            '\\r\\n\\r\\n' +
            // Value
            '(.*)' +
            // Padding.
            '\\r\\n$', 'is');
        const fields = data.split(
        // eslint-disable-next-line no-useless-escape
        new RegExp(`--${sanitizedBoundary}(?:--\s*$)?`, 'g'));
        return fields.reduce((result, field) => {
            const [match, name, value] = field.match(keyValuePattern) || [];
            if (!match) {
                return result;
            }
            result.push({ name, value });
            return result;
        }, []);
    }
    addFrame(frame) {
        this._frames.push(frame);
    }
    requestHeaderValue(headerName) {
        if (!this._requestHeaderValues.has(headerName)) {
            this._requestHeaderValues.set(headerName, this.computeHeaderValue(this.requestHeaders, headerName));
        }
        return this._requestHeaderValues.get(headerName);
    }
    getFilteredProtocolName() {
        const protocol = this._protocol.toLowerCase();
        if (protocol === 'h2') {
            return 'http/2.0';
        }
        return protocol.replace(/^http\/2(\.0)?\+/, 'http/2.0+');
    }
    parseParameters(queryString) {
        return queryString.split('&').map((pair) => {
            const position = pair.indexOf('=');
            if (position === -1) {
                return { name: pair, value: '' };
            }
            else {
                return {
                    name: pair.substring(0, position),
                    value: pair.substring(position + 1)
                };
            }
        });
    }
    computeHeaderValue(headers, headerName) {
        headerName = headerName.toLowerCase();
        const values = headers
            .filter(({ name }) => name.toLowerCase() === headerName)
            .map(({ value }) => value);
        if (!values.length) {
            return undefined;
        }
        // Set-Cookie values should be separated by '\n', not comma, otherwise cookies could not be parsed.
        if (headerName === 'set-cookie') {
            return values.join('\n');
        }
        return values.join(', ');
    }
}
exports.NetworkRequest = NetworkRequest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV0d29ya1JlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbmV0d29yay9OZXR3b3JrUmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2QkFBNEQ7QUFHNUQsaURBQThDO0FBUzlDLElBQVksa0JBSVg7QUFKRCxXQUFZLGtCQUFrQjtJQUM1Qix5Q0FBbUIsQ0FBQTtJQUNuQiwyQ0FBcUIsQ0FBQTtJQUNyQixxQ0FBZSxDQUFBO0FBQ2pCLENBQUMsRUFKVyxrQkFBa0IsR0FBbEIsMEJBQWtCLEtBQWxCLDBCQUFrQixRQUk3QjtBQVVELE1BQWEsY0FBYztJQTJaekIsWUFDVSxVQUFzQyxFQUM5QyxHQUFXLEVBQ0ssV0FBbUIsRUFDbkIsVUFBaUMsRUFBRSxFQUNuQyxRQUFtQyxFQUNuQyxTQUFxQyxFQUNwQyxPQUFnQjtRQU56QixlQUFVLEdBQVYsVUFBVSxDQUE0QjtRQUU5QixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUNuQixZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUNuQyxhQUFRLEdBQVIsUUFBUSxDQUEyQjtRQUNuQyxjQUFTLEdBQVQsU0FBUyxDQUE0QjtRQUNwQyxZQUFPLEdBQVAsT0FBTyxDQUFTO1FBaGEzQixtQkFBYyxHQUFvQyxDQUFDLENBQUMsQ0FBQztRQUNyRCx5QkFBb0IsR0FBd0IsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDdEUsMEJBQXFCLEdBQXdCLElBQUksR0FBRyxFQUd6RCxDQUFDO1FBR0ksNEJBQXVCLEdBRTNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFXdkIsMEJBQXFCLEdBQVksS0FBSyxDQUFDO1FBVXZDLHlCQUFvQixHQUFZLEtBQUssQ0FBQztRQVV0QyxrQkFBYSxHQUFZLEdBQUcsQ0FBQztRQVU3QixjQUFTLEdBQVcsRUFBRSxDQUFDO1FBVXZCLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBVXpCLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FB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LEVBQUUsS0FBSyxVQUFVLENBQUM7YUFDL0QsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFFRCxtR0FBbUc7UUFDbkcsSUFBSSxVQUFVLEtBQUssWUFBWSxFQUFFO1lBQy9CLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQjtRQUVELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUE1d0JELHdDQTR3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvdG9jb2wgZnJvbSAnZGV2dG9vbHMtcHJvdG9jb2wnO1xyXG5pbXBvcnQgeyBwYXJzZSBhcyBwYXJzZVVybCwgVXJsV2l0aFN0cmluZ1F1ZXJ5IH0gZnJvbSAndXJsJztcclxuaW1wb3J0IHsgSGVhZGVyLCBQYXJhbSwgUXVlcnlTdHJpbmcgfSBmcm9tICdoYXItZm9ybWF0JztcclxuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gJ2Nocm9tZS1yZW1vdGUtaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgQ29va2llUGFyc2VyIH0gZnJvbSAnLi9Db29raWVQYXJzZXInO1xyXG5pbXBvcnQgeyBOZXR3b3JrQ29va2llIH0gZnJvbSAnLi9OZXR3b3JrQ29va2llJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudERhdGEge1xyXG4gIGVycm9yPzogc3RyaW5nO1xyXG4gIHRleHQ/OiBzdHJpbmc7XHJcbiAgZW5jb2Rpbmc/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFdlYlNvY2tldEZyYW1lVHlwZSB7XHJcbiAgUmVxdWVzdCA9ICdyZXF1ZXN0JyxcclxuICBSZXNwb25zZSA9ICdyZXNwb25zZScsXHJcbiAgRXJyb3IgPSAnZXJyb3InXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV2ViU29ja2V0IHtcclxuICB0eXBlOiBXZWJTb2NrZXRGcmFtZVR5cGU7XHJcbiAgZGF0YTogc3RyaW5nO1xyXG4gIHRpbWU6IFByb3RvY29sLk5ldHdvcmsuTW9ub3RvbmljVGltZTtcclxuICBvcENvZGU6IG51bWJlcjtcclxuICBtYXNrOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTmV0d29ya1JlcXVlc3Qge1xyXG4gIHByaXZhdGUgX2NvbnRlbnREYXRhPzogQ29udGVudERhdGE7XHJcbiAgcHJpdmF0ZSBfd2FsbElzc3VlVGltZTogUHJvdG9jb2wuTmV0d29yay5UaW1lU2luY2VFcG9jaCA9IC0xO1xyXG4gIHByaXZhdGUgX3JlcXVlc3RIZWFkZXJWYWx1ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xyXG4gIHByaXZhdGUgX3Jlc3BvbnNlSGVhZGVyVmFsdWVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcDxcclxuICAgIHN0cmluZyxcclxuICAgIHN0cmluZ1xyXG4gID4oKTtcclxuICBwcml2YXRlIF9wYXJzZWRRdWVyeVBhcmFtZXRlcnM/OiBRdWVyeVN0cmluZ1tdO1xyXG4gIHByaXZhdGUgX2N1cnJlbnRQcmlvcml0eT86IFByb3RvY29sLk5ldHdvcmsuUmVzb3VyY2VQcmlvcml0eTtcclxuICBwcml2YXRlIF9yZXF1ZXN0Rm9ybURhdGFQcm9taXNlOiBQcm9taXNlPFxyXG4gICAgc3RyaW5nIHwgdW5kZWZpbmVkXHJcbiAgPiA9IFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xyXG4gIHByaXZhdGUgX2Zvcm1QYXJhbWV0ZXJzUHJvbWlzZT86IFByb21pc2U8UGFyYW1bXT47XHJcblxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWlnbm9yZVxyXG4gIC8vIEB0cy1pZ25vcmVcclxuICBwcml2YXRlIF9zaWduZWRFeGNoYW5nZUluZm8/OiBQcm90b2NvbC5OZXR3b3JrLlNpZ25lZEV4Y2hhbmdlSW5mbztcclxuXHJcbiAgc2V0IHNpZ25lZEV4Y2hhbmdlSW5mbyhpbmZvOiBQcm90b2NvbC5OZXR3b3JrLlNpZ25lZEV4Y2hhbmdlSW5mbykge1xyXG4gICAgdGhpcy5fc2lnbmVkRXhjaGFuZ2VJbmZvID0gaW5mbztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2hhc0V4dHJhUmVzcG9uc2VJbmZvOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIGdldCBoYXNFeHRyYVJlc3BvbnNlSW5mbygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9oYXNFeHRyYVJlc3BvbnNlSW5mbztcclxuICB9XHJcblxyXG4gIHNldCBoYXNFeHRyYVJlc3BvbnNlSW5mbyh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5faGFzRXh0cmFSZXNwb25zZUluZm8gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2hhc0V4dHJhUmVxdWVzdEluZm86IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgZ2V0IGhhc0V4dHJhUmVxdWVzdEluZm8oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5faGFzRXh0cmFSZXF1ZXN0SW5mbztcclxuICB9XHJcblxyXG4gIHNldCBoYXNFeHRyYVJlcXVlc3RJbmZvKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9oYXNFeHRyYVJlcXVlc3RJbmZvID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9jb25uZWN0aW9uSWQ/OiBzdHJpbmcgPSAnMCc7XHJcblxyXG4gIGdldCBjb25uZWN0aW9uSWQoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uSWQ7XHJcbiAgfVxyXG5cclxuICBzZXQgY29ubmVjdGlvbklkKHZhbHVlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuX2Nvbm5lY3Rpb25JZCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcHJvdG9jb2w6IHN0cmluZyA9ICcnO1xyXG5cclxuICBnZXQgcHJvdG9jb2woKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9wcm90b2NvbDtcclxuICB9XHJcblxyXG4gIHNldCBwcm90b2NvbCh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl9wcm90b2NvbCA9IHZhbHVlID8/ICcnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVxdWVzdFRpbWU6IG51bWJlciA9IDA7XHJcblxyXG4gIGdldCByZXF1ZXN0VGltZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RUaW1lO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJlcXVlc3RUaW1lKHZhbHVlOiBudW1iZXIpIHtcclxuICAgIHRoaXMuX3JlcXVlc3RUaW1lID0gdmFsdWUgPz8gMDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3JlcXVlc3RNZXRob2Q6IHN0cmluZyA9ICcnO1xyXG5cclxuICBnZXQgcmVxdWVzdE1ldGhvZCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RNZXRob2Q7XHJcbiAgfVxyXG5cclxuICBzZXQgcmVxdWVzdE1ldGhvZCh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl9yZXF1ZXN0TWV0aG9kID0gdmFsdWUgPz8gJyc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9zdGF0dXNUZXh0OiBzdHJpbmcgPSAnJztcclxuXHJcbiAgZ2V0IHN0YXR1c1RleHQoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGF0dXNUZXh0O1xyXG4gIH1cclxuXHJcbiAgc2V0IHN0YXR1c1RleHQodmFsdWU6IHN0cmluZykge1xyXG4gICAgdGhpcy5fc3RhdHVzVGV4dCA9IHZhbHVlID8/ICcnO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcGFyc2VkVVJMPzogVXJsV2l0aFN0cmluZ1F1ZXJ5O1xyXG5cclxuICBnZXQgcGFyc2VkVVJMKCk6IFVybFdpdGhTdHJpbmdRdWVyeSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGFyc2VkVVJMO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfdXJsPzogc3RyaW5nO1xyXG5cclxuICBnZXQgdXJsKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5fdXJsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVtb3RlQWRkcmVzczogc3RyaW5nID0gJyc7XHJcblxyXG4gIGdldCByZW1vdGVBZGRyZXNzKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVtb3RlQWRkcmVzcztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3N0YXJ0VGltZTogUHJvdG9jb2wuTmV0d29yay5Nb25vdG9uaWNUaW1lID0gLTE7XHJcblxyXG4gIGdldCBzdGFydFRpbWUoKTogUHJvdG9jb2wuTmV0d29yay5Nb25vdG9uaWNUaW1lIHtcclxuICAgIHJldHVybiB0aGlzLl9zdGFydFRpbWUgfHwgLTE7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pc3N1ZVRpbWU6IFByb3RvY29sLk5ldHdvcmsuTW9ub3RvbmljVGltZSA9IC0xO1xyXG5cclxuICBnZXQgaXNzdWVUaW1lKCk6IFByb3RvY29sLk5ldHdvcmsuTW9ub3RvbmljVGltZSB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNzdWVUaW1lO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfZW5kVGltZTogbnVtYmVyID0gLTE7XHJcblxyXG4gIGdldCBlbmRUaW1lKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5kVGltZSB8fCAtMTtcclxuICB9XHJcblxyXG4gIHNldCBlbmRUaW1lKHgpIHtcclxuICAgIGlmICh0aGlzLnRpbWluZyAmJiB0aGlzLnRpbWluZy5yZXF1ZXN0VGltZSkge1xyXG4gICAgICB0aGlzLl9lbmRUaW1lID0gTWF0aC5tYXgoeCwgdGhpcy5yZXNwb25zZVJlY2VpdmVkVGltZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9lbmRUaW1lID0geDtcclxuICAgICAgaWYgKHRoaXMuX3Jlc3BvbnNlUmVjZWl2ZWRUaW1lID4geCkge1xyXG4gICAgICAgIHRoaXMuX3Jlc3BvbnNlUmVjZWl2ZWRUaW1lID0geDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVzcG9uc2VSZWNlaXZlZFRpbWU6IG51bWJlciA9IC0xO1xyXG5cclxuICBnZXQgcmVzcG9uc2VSZWNlaXZlZFRpbWUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9yZXNwb25zZVJlY2VpdmVkVGltZSB8fCAtMTtcclxuICB9XHJcblxyXG4gIHNldCByZXNwb25zZVJlY2VpdmVkVGltZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9yZXNwb25zZVJlY2VpdmVkVGltZSA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVzb3VyY2VTaXplOiBudW1iZXIgPSAwO1xyXG5cclxuICBnZXQgcmVzb3VyY2VTaXplKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVzb3VyY2VTaXplIHx8IDA7XHJcbiAgfVxyXG5cclxuICBzZXQgcmVzb3VyY2VTaXplKHZhbHVlOiBudW1iZXIpIHtcclxuICAgIHRoaXMuX3Jlc291cmNlU2l6ZSA9IHZhbHVlID8/IDA7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF90cmFuc2ZlclNpemU6IG51bWJlciA9IDA7XHJcblxyXG4gIGdldCB0cmFuc2ZlclNpemUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl90cmFuc2ZlclNpemUgfHwgMDtcclxuICB9XHJcblxyXG4gIHNldCB0cmFuc2ZlclNpemUodmFsdWU6IG51bWJlcikge1xyXG4gICAgdGhpcy5fdHJhbnNmZXJTaXplID0gdmFsdWUgPz8gMDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3RpbWluZz86IFByb3RvY29sLk5ldHdvcmsuUmVzb3VyY2VUaW1pbmc7XHJcblxyXG4gIGdldCB0aW1pbmcoKTogUHJvdG9jb2wuTmV0d29yay5SZXNvdXJjZVRpbWluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5fdGltaW5nO1xyXG4gIH1cclxuXHJcbiAgc2V0IHRpbWluZyh0aW1pbmdJbmZvOiBQcm90b2NvbC5OZXR3b3JrLlJlc291cmNlVGltaW5nKSB7XHJcbiAgICBpZiAoIXRpbWluZ0luZm8pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3N0YXJ0VGltZSA9IHRpbWluZ0luZm8ucmVxdWVzdFRpbWU7XHJcblxyXG4gICAgY29uc3QgaGVhZGVyc1JlY2VpdmVkVGltZTogbnVtYmVyID1cclxuICAgICAgdGltaW5nSW5mby5yZXF1ZXN0VGltZSArIHRpbWluZ0luZm8ucmVjZWl2ZUhlYWRlcnNFbmQgLyAxMDAwLjA7XHJcblxyXG4gICAgaWYgKFxyXG4gICAgICAodGhpcy5fcmVzcG9uc2VSZWNlaXZlZFRpbWUgfHwgLTEpIDwgMCB8fFxyXG4gICAgICB0aGlzLl9yZXNwb25zZVJlY2VpdmVkVGltZSA+IGhlYWRlcnNSZWNlaXZlZFRpbWVcclxuICAgICkge1xyXG4gICAgICB0aGlzLl9yZXNwb25zZVJlY2VpdmVkVGltZSA9IGhlYWRlcnNSZWNlaXZlZFRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YXJ0VGltZSA+IHRoaXMuX3Jlc3BvbnNlUmVjZWl2ZWRUaW1lKSB7XHJcbiAgICAgIHRoaXMuX3Jlc3BvbnNlUmVjZWl2ZWRUaW1lID0gdGhpcy5fc3RhcnRUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3RpbWluZyA9IHRpbWluZ0luZm87XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9taW1lVHlwZT86IHN0cmluZztcclxuXHJcbiAgZ2V0IG1pbWVUeXBlKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5fbWltZVR5cGU7XHJcbiAgfVxyXG5cclxuICBzZXQgbWltZVR5cGUodmFsdWU6IHN0cmluZykge1xyXG4gICAgdGhpcy5fbWltZVR5cGUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3Jlc291cmNlVHlwZTogUHJvdG9jb2wuTmV0d29yay5SZXNvdXJjZVR5cGUgPSAnT3RoZXInO1xyXG5cclxuICBnZXQgcmVzb3VyY2VUeXBlKCk6IFByb3RvY29sLk5ldHdvcmsuUmVzb3VyY2VUeXBlIHtcclxuICAgIHJldHVybiB0aGlzLl9yZXNvdXJjZVR5cGU7XHJcbiAgfVxyXG5cclxuICBzZXQgcmVzb3VyY2VUeXBlKHJlc291cmNlVHlwZTogUHJvdG9jb2wuTmV0d29yay5SZXNvdXJjZVR5cGUpIHtcclxuICAgIHRoaXMuX3Jlc291cmNlVHlwZSA9IHJlc291cmNlVHlwZSA/PyAnT3RoZXInO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVkaXJlY3RTb3VyY2U/OiBOZXR3b3JrUmVxdWVzdDtcclxuXHJcbiAgZ2V0IHJlZGlyZWN0U291cmNlKCk6IE5ldHdvcmtSZXF1ZXN0IHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLl9yZWRpcmVjdFNvdXJjZTtcclxuICB9XHJcblxyXG4gIHNldCByZWRpcmVjdFNvdXJjZShvcmlnaW5hdGluZ1JlcXVlc3Q6IE5ldHdvcmtSZXF1ZXN0KSB7XHJcbiAgICB0aGlzLl9yZWRpcmVjdFNvdXJjZSA9IG9yaWdpbmF0aW5nUmVxdWVzdDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3JlcXVlc3RIZWFkZXJzOiBIZWFkZXJbXSA9IFtdO1xyXG5cclxuICBnZXQgcmVxdWVzdEhlYWRlcnMoKTogSGVhZGVyW10ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RIZWFkZXJzO1xyXG4gIH1cclxuXHJcbiAgc2V0IHJlcXVlc3RIZWFkZXJzKGhlYWRlcnM6IEhlYWRlcltdKSB7XHJcbiAgICB0aGlzLl9yZXF1ZXN0SGVhZGVycyA9IGhlYWRlcnM7XHJcbiAgICB0aGlzLl9yZXF1ZXN0SGVhZGVyVmFsdWVzLmNsZWFyKCk7XHJcbiAgICBkZWxldGUgdGhpcy5fcmVxdWVzdENvb2tpZXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9yZXF1ZXN0Q29va2llcz86IE5ldHdvcmtDb29raWVbXTtcclxuXHJcbiAgZ2V0IHJlcXVlc3RDb29raWVzKCk6IE5ldHdvcmtDb29raWVbXSB8IHVuZGVmaW5lZCB7XHJcbiAgICBpZiAoIXRoaXMuX3JlcXVlc3RDb29raWVzKSB7XHJcbiAgICAgIGNvbnN0IGNvb2tpZSA9IHRoaXMucmVxdWVzdEhlYWRlclZhbHVlKCdDb29raWUnKTtcclxuICAgICAgdGhpcy5fcmVxdWVzdENvb2tpZXMgPSBuZXcgQ29va2llUGFyc2VyKCkucGFyc2VDb29raWUoY29va2llKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdENvb2tpZXM7XHJcbiAgfVxyXG5cclxuICBnZXQgY29udGVudExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgY29udGVudExlbmd0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdGhpcy5yZXF1ZXN0SGVhZGVyVmFsdWUoXHJcbiAgICAgICdDb250ZW50LUxlbmd0aCdcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIGlzTmFOKCtjb250ZW50TGVuZ3RoKSA/IDAgOiBwYXJzZUludChjb250ZW50TGVuZ3RoLCAxMCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9yZXF1ZXN0SGVhZGVyc1RleHQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICBnZXQgcmVxdWVzdEhlYWRlcnNUZXh0KCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdEhlYWRlcnNUZXh0O1xyXG4gIH1cclxuXHJcbiAgc2V0IHJlcXVlc3RIZWFkZXJzVGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgIHRoaXMuX3JlcXVlc3RIZWFkZXJzVGV4dCA9IHRleHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9jb25uZWN0aW9uUmV1c2VkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIGdldCBjb25uZWN0aW9uUmV1c2VkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb25SZXVzZWQ7XHJcbiAgfVxyXG5cclxuICBzZXQgY29ubmVjdGlvblJldXNlZCh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fY29ubmVjdGlvblJldXNlZCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVzcG9uc2VIZWFkZXJzOiBIZWFkZXJbXSA9IFtdO1xyXG5cclxuICBnZXQgcmVzcG9uc2VIZWFkZXJzKCk6IEhlYWRlcltdIHtcclxuICAgIHJldHVybiB0aGlzLl9yZXNwb25zZUhlYWRlcnMgfHwgW107XHJcbiAgfVxyXG5cclxuICBzZXQgcmVzcG9uc2VIZWFkZXJzKHZhbHVlOiBIZWFkZXJbXSkge1xyXG4gICAgdGhpcy5fcmVzcG9uc2VIZWFkZXJzID0gdmFsdWU7XHJcbiAgICBkZWxldGUgdGhpcy5fcmVzcG9uc2VDb29raWVzO1xyXG4gICAgdGhpcy5fcmVzcG9uc2VIZWFkZXJWYWx1ZXMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3Jlc3BvbnNlSGVhZGVyc1RleHQ6IHN0cmluZyA9ICcnO1xyXG5cclxuICBnZXQgcmVzcG9uc2VIZWFkZXJzVGV4dCgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Jlc3BvbnNlSGVhZGVyc1RleHQ7XHJcbiAgfVxyXG5cclxuICBzZXQgcmVzcG9uc2VIZWFkZXJzVGV4dCh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl9yZXNwb25zZUhlYWRlcnNUZXh0ID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9yZXNwb25zZUNvb2tpZXM/OiBOZXR3b3JrQ29va2llW107XHJcblxyXG4gIGdldCByZXNwb25zZUNvb2tpZXMoKTogTmV0d29ya0Nvb2tpZVtdIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmICghdGhpcy5fcmVzcG9uc2VDb29raWVzKSB7XHJcbiAgICAgIGNvbnN0IGNvb2tpZSA9IHRoaXMucmVzcG9uc2VIZWFkZXJWYWx1ZSgnU2V0LUNvb2tpZScpO1xyXG4gICAgICB0aGlzLl9yZXF1ZXN0Q29va2llcyA9IG5ldyBDb29raWVQYXJzZXIoKS5wYXJzZVNldENvb2tpZShjb29raWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLl9yZXNwb25zZUNvb2tpZXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9xdWVyeVN0cmluZz86IHN0cmluZztcclxuXHJcbiAgZ2V0IHF1ZXJ5U3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5fcXVlcnlTdHJpbmcgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fcXVlcnlTdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHF1ZXJ5U3RyaW5nOiBzdHJpbmcgPSBudWxsO1xyXG4gICAgY29uc3QgcXVlc3Rpb25NYXJrUG9zaXRpb246IG51bWJlciA9IHRoaXMudXJsLmluZGV4T2YoJz8nKTtcclxuXHJcbiAgICBpZiAocXVlc3Rpb25NYXJrUG9zaXRpb24gIT09IC0xKSB7XHJcbiAgICAgIHF1ZXJ5U3RyaW5nID0gdGhpcy51cmwuc3Vic3RyaW5nKHF1ZXN0aW9uTWFya1Bvc2l0aW9uICsgMSk7XHJcbiAgICAgIGNvbnN0IGhhc2hTaWduUG9zaXRpb246IG51bWJlciA9IHF1ZXJ5U3RyaW5nLmluZGV4T2YoJyMnKTtcclxuXHJcbiAgICAgIGlmIChoYXNoU2lnblBvc2l0aW9uICE9PSAtMSkge1xyXG4gICAgICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDAsIGhhc2hTaWduUG9zaXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZztcclxuXHJcbiAgICByZXR1cm4gdGhpcy5fcXVlcnlTdHJpbmc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pbml0aWFsUHJpb3JpdHk/OiBQcm90b2NvbC5OZXR3b3JrLlJlc291cmNlUHJpb3JpdHk7XHJcblxyXG4gIGdldCBpbml0aWFsUHJpb3JpdHkoKTogUHJvdG9jb2wuTmV0d29yay5SZXNvdXJjZVByaW9yaXR5IHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLl9pbml0aWFsUHJpb3JpdHk7XHJcbiAgfVxyXG5cclxuICBzZXQgaW5pdGlhbFByaW9yaXR5KHByaW9yaXR5OiBQcm90b2NvbC5OZXR3b3JrLlJlc291cmNlUHJpb3JpdHkpIHtcclxuICAgIHRoaXMuX2luaXRpYWxQcmlvcml0eSA9IHByaW9yaXR5O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfZnJhbWVzOiBXZWJTb2NrZXRbXSA9IFtdO1xyXG5cclxuICBnZXQgZnJhbWVzKCk6IFdlYlNvY2tldFtdIHtcclxuICAgIHJldHVybiB0aGlzLl9mcmFtZXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9zdGF0dXNDb2RlOiBudW1iZXIgPSAwO1xyXG5cclxuICBnZXQgc3RhdHVzQ29kZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0YXR1c0NvZGU7XHJcbiAgfVxyXG5cclxuICBzZXQgc3RhdHVzQ29kZSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9zdGF0dXNDb2RlID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBnZXQgcmVxdWVzdElkKCk6IFByb3RvY29sLk5ldHdvcmsuUmVxdWVzdElkIHtcclxuICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0SWQ7XHJcbiAgfVxyXG5cclxuICBnZXQgcmVxdWVzdEh0dHBWZXJzaW9uKCk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5yZXF1ZXN0SGVhZGVyc1RleHQpIHtcclxuICAgICAgY29uc3QgZmlyc3RMaW5lID0gdGhpcy5yZXF1ZXN0SGVhZGVyc1RleHQuc3BsaXQoL1xcclxcbi8pWzBdO1xyXG4gICAgICBjb25zdCBtYXRjaCA9IGZpcnN0TGluZS5tYXRjaCgvKEhUVFBcXC9cXGQrXFwuXFxkKykkLyk7XHJcblxyXG4gICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6ICdIVFRQLzAuOSc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmVyc2lvbiA9XHJcbiAgICAgIHRoaXMucmVxdWVzdEhlYWRlclZhbHVlKCd2ZXJzaW9uJykgfHwgdGhpcy5yZXF1ZXN0SGVhZGVyVmFsdWUoJzp2ZXJzaW9uJyk7XHJcbiAgICBpZiAodmVyc2lvbikge1xyXG4gICAgICByZXR1cm4gdmVyc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRGaWx0ZXJlZFByb3RvY29sTmFtZSgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHF1ZXJ5UGFyYW1ldGVycygpOiBRdWVyeVN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmICh0aGlzLl9wYXJzZWRRdWVyeVBhcmFtZXRlcnMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlZFF1ZXJ5UGFyYW1ldGVycztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMucXVlcnlTdHJpbmcpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fcGFyc2VkUXVlcnlQYXJhbWV0ZXJzID0gdGhpcy5wYXJzZVBhcmFtZXRlcnModGhpcy5xdWVyeVN0cmluZyk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX3BhcnNlZFF1ZXJ5UGFyYW1ldGVycztcclxuICB9XHJcblxyXG4gIGdldCByZXF1ZXN0Q29udGVudFR5cGUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3RIZWFkZXJWYWx1ZSgnQ29udGVudC1UeXBlJyk7XHJcbiAgfVxyXG5cclxuICBnZXQgcHJpb3JpdHkoKTogUHJvdG9jb2wuTmV0d29yay5SZXNvdXJjZVByaW9yaXR5IHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50UHJpb3JpdHkgfHwgdGhpcy5faW5pdGlhbFByaW9yaXR5IHx8IG51bGw7XHJcbiAgfVxyXG5cclxuICBzZXQgcHJpb3JpdHkocHJpb3JpdHk6IFByb3RvY29sLk5ldHdvcmsuUmVzb3VyY2VQcmlvcml0eSkge1xyXG4gICAgdGhpcy5fY3VycmVudFByaW9yaXR5ID0gcHJpb3JpdHk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX3JlcXVlc3RJZDogUHJvdG9jb2wuTmV0d29yay5SZXF1ZXN0SWQsXHJcbiAgICB1cmw6IHN0cmluZyxcclxuICAgIHB1YmxpYyByZWFkb25seSBkb2N1bWVudFVSTDogc3RyaW5nLFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGZyYW1lSWQ6IFByb3RvY29sLlBhZ2UuRnJhbWVJZCA9ICcnLFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGxvYWRlcklkOiBQcm90b2NvbC5OZXR3b3JrLkxvYWRlcklkLFxyXG4gICAgcHVibGljIHJlYWRvbmx5IGluaXRpYXRvcjogUHJvdG9jb2wuTmV0d29yay5Jbml0aWF0b3IsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IG5ldHdvcms6IE5ldHdvcmtcclxuICApIHtcclxuICAgIHRoaXMuc2V0VXJsKHVybCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN0YXRpYyBlc2NhcGVDaGFyYWN0ZXJzKFxyXG4gICAgc3RyOiBzdHJpbmcsXHJcbiAgICBjaGFyczogc3RyaW5nID0gJ15bXXt9KClcXFxcXFxcXC4kKis/fCdcclxuICApOiBzdHJpbmcge1xyXG4gICAgbGV0IGZvdW5kQ2hhciA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0IGxlbmd0aCA9IGNoYXJzLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmIChzdHIuaW5kZXhPZihjaGFycy5jaGFyQXQoaSkpICE9PSAtMSkge1xyXG4gICAgICAgIGZvdW5kQ2hhciA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWZvdW5kQ2hhcikge1xyXG4gICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByZXN1bHQgPSAnJztcclxuXHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN0ci5sZW5ndGg7ICsraikge1xyXG4gICAgICBpZiAoY2hhcnMuaW5kZXhPZihzdHIuY2hhckF0KGopKSAhPT0gLTEpIHtcclxuICAgICAgICByZXN1bHQgKz0gJ1xcXFwnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXN1bHQgKz0gc3RyLmNoYXJBdChqKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFVybCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fdXJsID09PSB2YWx1ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fdXJsID0gdmFsdWU7XHJcbiAgICB0aGlzLl9wYXJzZWRVUkwgPSBwYXJzZVVybCh2YWx1ZSk7XHJcbiAgICBkZWxldGUgdGhpcy5fcXVlcnlTdHJpbmc7XHJcbiAgICBkZWxldGUgdGhpcy5fcGFyc2VkUXVlcnlQYXJhbWV0ZXJzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFJlbW90ZUFkZHJlc3MoaXA6IHN0cmluZywgcG9ydDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLl9yZW1vdGVBZGRyZXNzID0gYCR7aXB9OiR7cG9ydH1gO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldElzc3VlVGltZShcclxuICAgIG1vbm90b25pY1RpbWU6IFByb3RvY29sLk5ldHdvcmsuTW9ub3RvbmljVGltZSxcclxuICAgIHdhbGxUaW1lOiBQcm90b2NvbC5OZXR3b3JrLlRpbWVTaW5jZUVwb2NoXHJcbiAgKTogdm9pZCB7XHJcbiAgICB0aGlzLl9pc3N1ZVRpbWUgPSBtb25vdG9uaWNUaW1lO1xyXG4gICAgdGhpcy5fd2FsbElzc3VlVGltZSA9IHdhbGxUaW1lO1xyXG4gICAgdGhpcy5fc3RhcnRUaW1lID0gbW9ub3RvbmljVGltZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpbmNyZWFzZVRyYW5zZmVyU2l6ZSh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLl90cmFuc2ZlclNpemUgPSAodGhpcy5fdHJhbnNmZXJTaXplIHx8IDApICsgdmFsdWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVxdWVzdEZvcm1EYXRhKCk6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3RzbGludC9jb25maWdcclxuICAgICAgaWYgKCF0aGlzLl9yZXF1ZXN0Rm9ybURhdGFQcm9taXNlKSB7XHJcbiAgICAgICAgdGhpcy5fcmVxdWVzdEZvcm1EYXRhUHJvbWlzZSA9IHRoaXMubmV0d29ya1xyXG4gICAgICAgICAgLmdldFJlcXVlc3RQb3N0RGF0YSh7IHJlcXVlc3RJZDogdGhpcy5yZXF1ZXN0SWQgfSlcclxuICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAoeyBwb3N0RGF0YSB9OiBQcm90b2NvbC5OZXR3b3JrLkdldFJlcXVlc3RQb3N0RGF0YVJlc3BvbnNlKSA9PlxyXG4gICAgICAgICAgICAgIHBvc3REYXRhXHJcbiAgICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdEZvcm1EYXRhUHJvbWlzZTtcclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0UmVxdWVzdEZvcm1EYXRhKGhhc0RhdGE6IGJvb2xlYW4sIGRhdGE6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5fcmVxdWVzdEZvcm1EYXRhUHJvbWlzZSA9XHJcbiAgICAgIGhhc0RhdGEgJiYgZGF0YSA9PT0gbnVsbCA/IG51bGwgOiBQcm9taXNlLnJlc29sdmUoZGF0YSk7XHJcbiAgICB0aGlzLl9mb3JtUGFyYW1ldGVyc1Byb21pc2UgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIF9wYXJzZUZvcm1QYXJhbWV0ZXJzKCk6IFByb21pc2U8UGFyYW1bXT4ge1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLnJlcXVlc3RDb250ZW50VHlwZT8ubWF0Y2goXHJcbiAgICAgICAgL15hcHBsaWNhdGlvblxcL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFxccyooOy4qKT8kL2lcclxuICAgICAgKVxyXG4gICAgKSB7XHJcbiAgICAgIGNvbnN0IGZvcm1VcmxlbmNvZGVkOiBzdHJpbmcgPSBhd2FpdCB0aGlzLnJlcXVlc3RGb3JtRGF0YSgpO1xyXG5cclxuICAgICAgaWYgKCFmb3JtVXJsZW5jb2RlZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VQYXJhbWV0ZXJzKGZvcm1VcmxlbmNvZGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtdWx0aXBhcnREZXRhaWxzOiBSZWdFeHBNYXRjaEFycmF5ID0gdGhpcy5yZXF1ZXN0Q29udGVudFR5cGUubWF0Y2goXHJcbiAgICAgIC9ebXVsdGlwYXJ0XFwvZm9ybS1kYXRhXFxzKjtcXHMqYm91bmRhcnlcXHMqPVxccyooXFxTKylcXHMqJC9cclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFtdWx0aXBhcnREZXRhaWxzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBib3VuZGFyeTogc3RyaW5nID0gbXVsdGlwYXJ0RGV0YWlsc1sxXTtcclxuICAgIGlmICghYm91bmRhcnkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZvcm1EYXRhOiBzdHJpbmcgPSBhd2FpdCB0aGlzLnJlcXVlc3RGb3JtRGF0YSgpO1xyXG4gICAgaWYgKCFmb3JtRGF0YSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucGFyc2VNdWx0aXBhcnRGb3JtRGF0YVBhcmFtZXRlcnMoZm9ybURhdGEsIGJvdW5kYXJ5KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRXYWxsVGltZShtb25vdG9uaWNUaW1lOiBQcm90b2NvbC5OZXR3b3JrLk1vbm90b25pY1RpbWUpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3dhbGxJc3N1ZVRpbWVcclxuICAgICAgPyB0aGlzLl93YWxsSXNzdWVUaW1lIC0gdGhpcy5faXNzdWVUaW1lICsgbW9ub3RvbmljVGltZVxyXG4gICAgICA6IG1vbm90b25pY1RpbWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZm9ybVBhcmFtZXRlcnMoKTogUHJvbWlzZTxQYXJhbVtdPiB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3RzbGludC9jb25maWdcclxuICAgIGlmICghdGhpcy5fZm9ybVBhcmFtZXRlcnNQcm9taXNlKSB7XHJcbiAgICAgIHRoaXMuX2Zvcm1QYXJhbWV0ZXJzUHJvbWlzZSA9IHRoaXMuX3BhcnNlRm9ybVBhcmFtZXRlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fZm9ybVBhcmFtZXRlcnNQcm9taXNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc3BvbnNlSHR0cFZlcnNpb24oKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLl9yZXNwb25zZUhlYWRlcnNUZXh0KSB7XHJcbiAgICAgIGNvbnN0IGZpcnN0TGluZTogc3RyaW5nID0gdGhpcy5fcmVzcG9uc2VIZWFkZXJzVGV4dC5zcGxpdCgvXFxyXFxuLylbMF07XHJcbiAgICAgIGNvbnN0IG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5IHwgdW5kZWZpbmVkID0gZmlyc3RMaW5lLm1hdGNoKFxyXG4gICAgICAgIC9eKEhUVFBcXC9cXGQrXFwuXFxkKykvXHJcbiAgICAgICk7XHJcblxyXG4gICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6ICdIVFRQLzAuOSc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdmVyc2lvbiA9XHJcbiAgICAgIHRoaXMucmVzcG9uc2VIZWFkZXJWYWx1ZSgndmVyc2lvbicpIHx8XHJcbiAgICAgIHRoaXMucmVzcG9uc2VIZWFkZXJWYWx1ZSgnOnZlcnNpb24nKTtcclxuXHJcbiAgICBpZiAodmVyc2lvbikge1xyXG4gICAgICByZXR1cm4gdmVyc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXRGaWx0ZXJlZFByb3RvY29sTmFtZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFzeW5jIGNvbnRlbnREYXRhKCk6IFByb21pc2U8Q29udGVudERhdGE+IHtcclxuICAgIGlmICh0aGlzLl9jb250ZW50RGF0YSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fY29udGVudERhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucmVzb3VyY2VUeXBlID09PSAnV2ViU29ja2V0Jykge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVycm9yOiAnQ29udGVudCBmb3IgV2ViU29ja2V0cyBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCdcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZTogUHJvdG9jb2wuTmV0d29yay5HZXRSZXNwb25zZUJvZHlSZXNwb25zZSA9IGF3YWl0IHRoaXMubmV0d29yay5nZXRSZXNwb25zZUJvZHkoXHJcbiAgICAgICAgeyByZXF1ZXN0SWQ6IHRoaXMucmVxdWVzdElkIH1cclxuICAgICAgKTtcclxuICAgICAgdGhpcy5fY29udGVudERhdGEgPSB7XHJcbiAgICAgICAgdGV4dDogcmVzcG9uc2UuYm9keSxcclxuICAgICAgICBlbmNvZGluZzogcmVzcG9uc2UuYmFzZTY0RW5jb2RlZCA/ICdiYXNlNjQnIDogdW5kZWZpbmVkXHJcbiAgICAgIH07XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHRoaXMuX2NvbnRlbnREYXRhID0geyBlcnJvcjogZS5tZXNzYWdlIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnREYXRhO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZFByb3RvY29sRnJhbWVFcnJvcihcclxuICAgIGVycm9yTWVzc2FnZTogc3RyaW5nLFxyXG4gICAgdGltZTogUHJvdG9jb2wuTmV0d29yay5Nb25vdG9uaWNUaW1lXHJcbiAgKTogdm9pZCB7XHJcbiAgICB0aGlzLmFkZEZyYW1lKHtcclxuICAgICAgdHlwZTogV2ViU29ja2V0RnJhbWVUeXBlLkVycm9yLFxyXG4gICAgICBkYXRhOiBlcnJvck1lc3NhZ2UsXHJcbiAgICAgIHRpbWUsXHJcbiAgICAgIG9wQ29kZTogLTEsXHJcbiAgICAgIG1hc2s6IGZhbHNlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRQcm90b2NvbEZyYW1lKFxyXG4gICAgcmVzcG9uc2U6IFByb3RvY29sLk5ldHdvcmsuV2ViU29ja2V0RnJhbWUsXHJcbiAgICB0aW1lOiBQcm90b2NvbC5OZXR3b3JrLk1vbm90b25pY1RpbWUsXHJcbiAgICBzZW50OiBib29sZWFuXHJcbiAgKTogdm9pZCB7XHJcbiAgICBjb25zdCB0eXBlOiBXZWJTb2NrZXRGcmFtZVR5cGUgPSBzZW50XHJcbiAgICAgID8gV2ViU29ja2V0RnJhbWVUeXBlLlJlcXVlc3RcclxuICAgICAgOiBXZWJTb2NrZXRGcmFtZVR5cGUuUmVzcG9uc2U7XHJcblxyXG4gICAgdGhpcy5hZGRGcmFtZSh7XHJcbiAgICAgIHR5cGUsXHJcbiAgICAgIGRhdGE6IHJlc3BvbnNlLnBheWxvYWREYXRhLFxyXG4gICAgICB0aW1lLFxyXG4gICAgICBvcENvZGU6IHJlc3BvbnNlLm9wY29kZSxcclxuICAgICAgbWFzazogcmVzcG9uc2UubWFza1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbWFya0FzUmVkaXJlY3QocmVkaXJlY3RDb3VudDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLl9yZXF1ZXN0SWQgPSBgJHt0aGlzLnJlcXVlc3RJZH06cmVkaXJlY3RlZC4ke3JlZGlyZWN0Q291bnR9YDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRFeHRyYVJlcXVlc3RJbmZvKGV4dHJhUmVxdWVzdEluZm86IHtcclxuICAgIHJlcXVlc3RIZWFkZXJzOiBIZWFkZXJbXTtcclxuICB9KTogdm9pZCB7XHJcbiAgICB0aGlzLnJlcXVlc3RIZWFkZXJzID0gZXh0cmFSZXF1ZXN0SW5mby5yZXF1ZXN0SGVhZGVycztcclxuICAgIHRoaXMuX2hhc0V4dHJhUmVxdWVzdEluZm8gPSB0cnVlO1xyXG4gICAgdGhpcy5yZXF1ZXN0SGVhZGVyc1RleHQgPSAnJztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRFeHRyYVJlc3BvbnNlSW5mbyhleHRyYVJlc3BvbnNlSW5mbzoge1xyXG4gICAgcmVzcG9uc2VIZWFkZXJzOiBIZWFkZXJbXTtcclxuICAgIHJlc3BvbnNlSGVhZGVyc1RleHQ6IHN0cmluZztcclxuICB9KTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc3BvbnNlSGVhZGVycyA9IGV4dHJhUmVzcG9uc2VJbmZvLnJlc3BvbnNlSGVhZGVycztcclxuXHJcbiAgICBpZiAoZXh0cmFSZXNwb25zZUluZm8ucmVzcG9uc2VIZWFkZXJzVGV4dCkge1xyXG4gICAgICB0aGlzLnJlc3BvbnNlSGVhZGVyc1RleHQgPSBleHRyYVJlc3BvbnNlSW5mby5yZXNwb25zZUhlYWRlcnNUZXh0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHJlcXVlc3RIZWFkZXJzVGV4dDogc3RyaW5nID0gYCR7dGhpcy5fcmVxdWVzdE1ldGhvZH0gJHt0aGlzLnBhcnNlZFVSTC5wYXRofWA7XHJcblxyXG4gICAgICBpZiAodGhpcy5wYXJzZWRVUkwucXVlcnkpIHtcclxuICAgICAgICByZXF1ZXN0SGVhZGVyc1RleHQgKz0gYD8ke3RoaXMucGFyc2VkVVJMLnF1ZXJ5fWA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcXVlc3RIZWFkZXJzVGV4dCArPSBgIEhUVFAvMS4xXFxyXFxuYDtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCB2YWx1ZSB9IG9mIHRoaXMucmVxdWVzdEhlYWRlcnMpIHtcclxuICAgICAgICByZXF1ZXN0SGVhZGVyc1RleHQgKz0gYCR7bmFtZX06ICR7dmFsdWV9XFxyXFxuYDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5yZXF1ZXN0SGVhZGVyc1RleHQgPSByZXF1ZXN0SGVhZGVyc1RleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5faGFzRXh0cmFSZXNwb25zZUluZm8gPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc3BvbnNlSGVhZGVyVmFsdWUoaGVhZGVyTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmICghdGhpcy5fcmVzcG9uc2VIZWFkZXJWYWx1ZXMuaGFzKGhlYWRlck5hbWUpKSB7XHJcbiAgICAgIHRoaXMuX3Jlc3BvbnNlSGVhZGVyVmFsdWVzLnNldChcclxuICAgICAgICBoZWFkZXJOYW1lLFxyXG4gICAgICAgIHRoaXMuY29tcHV0ZUhlYWRlclZhbHVlKHRoaXMucmVzcG9uc2VIZWFkZXJzLCBoZWFkZXJOYW1lKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLl9yZXNwb25zZUhlYWRlclZhbHVlcy5nZXQoaGVhZGVyTmFtZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhcnNlTXVsdGlwYXJ0Rm9ybURhdGFQYXJhbWV0ZXJzKFxyXG4gICAgZGF0YTogc3RyaW5nLFxyXG4gICAgYm91bmRhcnk6IHN0cmluZ1xyXG4gICk6IFBhcmFtW10ge1xyXG4gICAgY29uc3Qgc2FuaXRpemVkQm91bmRhcnk6IHN0cmluZyA9IE5ldHdvcmtSZXF1ZXN0LmVzY2FwZUNoYXJhY3RlcnMoYm91bmRhcnkpO1xyXG4gICAgY29uc3Qga2V5VmFsdWVQYXR0ZXJuOiBSZWdFeHAgPSBuZXcgUmVnRXhwKFxyXG4gICAgICAvLyBIZWFkZXIgd2l0aCBhbiBvcHRpb25hbCBmaWxlIG5hbWUuXHJcbiAgICAgICdeXFxcXHJcXFxcbmNvbnRlbnQtZGlzcG9zaXRpb25cXFxccyo6XFxcXHMqZm9ybS1kYXRhXFxcXHMqO1xcXFxzKm5hbWU9XCIoW15cIl0qKVwiKD86XFxcXHMqO1xcXFxzKmZpbGVuYW1lPVwiKFteXCJdKilcIik/JyArXHJcbiAgICAgICAgLy8gT3B0aW9uYWwgc2Vjb25kYXJ5IGhlYWRlciB3aXRoIHRoZSBjb250ZW50IHR5cGUuXHJcbiAgICAgICAgJyg/OlxcXFxyXFxcXG5jb250ZW50LXR5cGVcXFxccyo6XFxcXHMqKFteXFxcXHJcXFxcbl0qKSk/JyArXHJcbiAgICAgICAgLy8gUGFkZGluZy5cclxuICAgICAgICAnXFxcXHJcXFxcblxcXFxyXFxcXG4nICtcclxuICAgICAgICAvLyBWYWx1ZVxyXG4gICAgICAgICcoLiopJyArXHJcbiAgICAgICAgLy8gUGFkZGluZy5cclxuICAgICAgICAnXFxcXHJcXFxcbiQnLFxyXG4gICAgICAnaXMnXHJcbiAgICApO1xyXG4gICAgY29uc3QgZmllbGRzOiBzdHJpbmdbXSA9IGRhdGEuc3BsaXQoXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxyXG4gICAgICBuZXcgUmVnRXhwKGAtLSR7c2FuaXRpemVkQm91bmRhcnl9KD86LS1cXHMqJCk/YCwgJ2cnKVxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gZmllbGRzLnJlZHVjZSgocmVzdWx0OiBQYXJhbVtdLCBmaWVsZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGNvbnN0IFttYXRjaCwgbmFtZSwgdmFsdWVdID0gZmllbGQubWF0Y2goa2V5VmFsdWVQYXR0ZXJuKSB8fCBbXTtcclxuXHJcbiAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXN1bHQucHVzaCh7IG5hbWUsIHZhbHVlIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0sIFtdKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkRnJhbWUoZnJhbWU6IFdlYlNvY2tldCk6IHZvaWQge1xyXG4gICAgdGhpcy5fZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXF1ZXN0SGVhZGVyVmFsdWUoaGVhZGVyTmFtZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgIGlmICghdGhpcy5fcmVxdWVzdEhlYWRlclZhbHVlcy5oYXMoaGVhZGVyTmFtZSkpIHtcclxuICAgICAgdGhpcy5fcmVxdWVzdEhlYWRlclZhbHVlcy5zZXQoXHJcbiAgICAgICAgaGVhZGVyTmFtZSxcclxuICAgICAgICB0aGlzLmNvbXB1dGVIZWFkZXJWYWx1ZSh0aGlzLnJlcXVlc3RIZWFkZXJzLCBoZWFkZXJOYW1lKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0SGVhZGVyVmFsdWVzLmdldChoZWFkZXJOYW1lKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RmlsdGVyZWRQcm90b2NvbE5hbWUoKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHByb3RvY29sID0gdGhpcy5fcHJvdG9jb2wudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICBpZiAocHJvdG9jb2wgPT09ICdoMicpIHtcclxuICAgICAgcmV0dXJuICdodHRwLzIuMCc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByb3RvY29sLnJlcGxhY2UoL15odHRwXFwvMihcXC4wKT9cXCsvLCAnaHR0cC8yLjArJyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhcnNlUGFyYW1ldGVycyhxdWVyeVN0cmluZzogc3RyaW5nKTogUXVlcnlTdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gcXVlcnlTdHJpbmcuc3BsaXQoJyYnKS5tYXAoKHBhaXI6IHN0cmluZykgPT4ge1xyXG4gICAgICBjb25zdCBwb3NpdGlvbjogbnVtYmVyID0gcGFpci5pbmRleE9mKCc9Jyk7XHJcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm4geyBuYW1lOiBwYWlyLCB2YWx1ZTogJycgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgbmFtZTogcGFpci5zdWJzdHJpbmcoMCwgcG9zaXRpb24pLFxyXG4gICAgICAgICAgdmFsdWU6IHBhaXIuc3Vic3RyaW5nKHBvc2l0aW9uICsgMSlcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29tcHV0ZUhlYWRlclZhbHVlKFxyXG4gICAgaGVhZGVyczogSGVhZGVyW10sXHJcbiAgICBoZWFkZXJOYW1lOiBzdHJpbmdcclxuICApOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgaGVhZGVyTmFtZSA9IGhlYWRlck5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICBjb25zdCB2YWx1ZXM6IHN0cmluZ1tdID0gaGVhZGVyc1xyXG4gICAgICAuZmlsdGVyKCh7IG5hbWUgfTogSGVhZGVyKSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09IGhlYWRlck5hbWUpXHJcbiAgICAgIC5tYXAoKHsgdmFsdWUgfSkgPT4gdmFsdWUpO1xyXG5cclxuICAgIGlmICghdmFsdWVzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldC1Db29raWUgdmFsdWVzIHNob3VsZCBiZSBzZXBhcmF0ZWQgYnkgJ1xcbicsIG5vdCBjb21tYSwgb3RoZXJ3aXNlIGNvb2tpZXMgY291bGQgbm90IGJlIHBhcnNlZC5cclxuICAgIGlmIChoZWFkZXJOYW1lID09PSAnc2V0LWNvb2tpZScpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlcy5qb2luKCdcXG4nKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsdWVzLmpvaW4oJywgJyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==