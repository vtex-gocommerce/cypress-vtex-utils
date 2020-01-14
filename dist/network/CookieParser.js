"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkCookie_1 = require("./NetworkCookie");
class CookieParser {
    constructor() {
        this._lastCookiePosition = 0;
    }
    get cookies() {
        return this._cookies;
    }
    parseCookie(cookieHeader) {
        if (!this._initialize(cookieHeader)) {
            return;
        }
        for (let kv = this._extractKeyValue(); kv; kv = this._extractKeyValue()) {
            if (kv.key.charAt(0) === '$' && this._lastCookie) {
                this._lastCookie.addAttribute(kv.key.slice(1), kv.value);
            }
            else if (kv.key.toLowerCase() !== '$version' &&
                typeof kv.value === 'string') {
                this.addCookie(kv);
            }
            this.advanceAndCheckCookieDelimiter();
        }
        this.flushCookie();
        return this._cookies;
    }
    parseSetCookie(setCookieHeader) {
        if (!this._initialize(setCookieHeader)) {
            return;
        }
        for (let kv = this._extractKeyValue(); kv; kv = this._extractKeyValue()) {
            if (this._lastCookie) {
                this._lastCookie.addAttribute(kv.key, kv.value);
            }
            else {
                this.addCookie(kv);
            }
            if (this.advanceAndCheckCookieDelimiter()) {
                this.flushCookie();
            }
        }
        this.flushCookie();
        return this._cookies;
    }
    _initialize(headerValue) {
        this._input = headerValue;
        if (typeof headerValue !== 'string') {
            return false;
        }
        this._cookies = [];
        this._lastCookie = null;
        this._originalInputLength = this._input.length;
        return true;
    }
    flushCookie() {
        if (this._lastCookie) {
            this._lastCookie.size =
                this._originalInputLength -
                    this._input.length -
                    this._lastCookiePosition;
        }
        delete this._lastCookie;
    }
    _extractKeyValue() {
        var _a, _b;
        if (!((_a = this._input) === null || _a === void 0 ? void 0 : _a.length)) {
            return;
        }
        // Note: RFCs offer an option for quoted values that may contain commas and semicolons.
        // Many browsers/platforms do not support this, however (see http://webkit.org/b/16699
        // and http://crbug.com/12361). The logic below matches latest versions of IE, Firefox,
        // Chrome and Safari on some old platforms. The latest version of Safari supports quoted
        // cookie values, though.
        const keyValueMatch = /^[ \t]*([^\s=;]+)[ \t]*(?:=[ \t]*([^;\n]*))?/i.exec(this._input);
        if (!keyValueMatch) {
            return;
        }
        const result = {
            key: this.toCamelCase(keyValueMatch[1]),
            value: (_b = keyValueMatch[2]) === null || _b === void 0 ? void 0 : _b.trim(),
            position: this._originalInputLength - this._input.length
        };
        this._input = this._input.slice(keyValueMatch[0].length);
        return result;
    }
    toCamelCase(str) {
        return str
            .replace(/\s(.)/g, ($1) => $1.toUpperCase())
            .replace(/\s/g, '')
            .replace(/^(.)/, ($1) => $1.toLowerCase());
    }
    advanceAndCheckCookieDelimiter() {
        const match = /^\s*[\n;]\s*/.exec(this._input);
        if (!match) {
            return false;
        }
        this._input = this._input.slice(match[0].length);
        return match[0].match('\n') !== null;
    }
    addCookie(keyValue) {
        if (this._lastCookie) {
            this._lastCookie.size = keyValue.position - this._lastCookiePosition;
        }
        this._lastCookie =
            typeof keyValue.value === 'string'
                ? new NetworkCookie_1.NetworkCookie(keyValue.key, keyValue.value)
                : new NetworkCookie_1.NetworkCookie('', keyValue.key);
        this._lastCookiePosition = keyValue.position;
        this._cookies.push(this._lastCookie);
    }
}
exports.CookieParser = CookieParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29va2llUGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL25ldHdvcmsvQ29va2llUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQWdEO0FBUWhELE1BQWEsWUFBWTtJQUF6QjtRQUlVLHdCQUFtQixHQUFXLENBQUMsQ0FBQztJQXVJMUMsQ0FBQztJQW5JQyxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUVNLFdBQVcsQ0FBQyxZQUFvQjtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuQyxPQUFPO1NBQ1I7UUFFRCxLQUFLLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUU7WUFDdkUsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFEO2lCQUFNLElBQ0wsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxVQUFVO2dCQUNuQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUM1QjtnQkFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3BCO1lBRUQsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7U0FDdkM7UUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSxj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Q0FBQztJQUN2RCxDQUFDO0lBRU8sOEJBQThCO1FBQ3BDLE1BQU0sS0FBSyxHQUFnQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU1RSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWpELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7SUFDdkMsQ0FBQztJQUVPLFNBQVMsQ0FBQyxRQUFrQjtRQUNsQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7U0FDdEU7UUFFRCxJQUFJLENBQUMsV0FBVztZQUNkLE9BQU8sUUFBUSxDQUFDLEtBQUssS0FBSyxRQUFRO2dCQUNoQyxDQUFDLENBQUMsSUFBSSw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDakQsQ0FBQyxDQUFDLElBQUksNkJBQWEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2QyxDQUFDO0NBQ0Y7QUEzSUQsb0NBMklDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV0d29ya0Nvb2tpZSB9IGZyb20gJy4vTmV0d29ya0Nvb2tpZSc7XHJcblxyXG5pbnRlcmZhY2UgS2V5VmFsdWUge1xyXG4gIGtleTogc3RyaW5nO1xyXG4gIHZhbHVlPzogc3RyaW5nO1xyXG4gIHBvc2l0aW9uOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDb29raWVQYXJzZXIge1xyXG4gIHByaXZhdGUgX2lucHV0Pzogc3RyaW5nO1xyXG4gIHByaXZhdGUgX29yaWdpbmFsSW5wdXRMZW5ndGg/OiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfbGFzdENvb2tpZT86IE5ldHdvcmtDb29raWU7XHJcbiAgcHJpdmF0ZSBfbGFzdENvb2tpZVBvc2l0aW9uOiBudW1iZXIgPSAwO1xyXG5cclxuICBwcml2YXRlIF9jb29raWVzOiBOZXR3b3JrQ29va2llW107XHJcblxyXG4gIGdldCBjb29raWVzKCk6IE5ldHdvcmtDb29raWVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY29va2llcztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwYXJzZUNvb2tpZShjb29raWVIZWFkZXI6IHN0cmluZyk6IE5ldHdvcmtDb29raWVbXSB8IHVuZGVmaW5lZCB7XHJcbiAgICBpZiAoIXRoaXMuX2luaXRpYWxpemUoY29va2llSGVhZGVyKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQga3YgPSB0aGlzLl9leHRyYWN0S2V5VmFsdWUoKTsga3Y7IGt2ID0gdGhpcy5fZXh0cmFjdEtleVZhbHVlKCkpIHtcclxuICAgICAgaWYgKGt2LmtleS5jaGFyQXQoMCkgPT09ICckJyAmJiB0aGlzLl9sYXN0Q29va2llKSB7XHJcbiAgICAgICAgdGhpcy5fbGFzdENvb2tpZS5hZGRBdHRyaWJ1dGUoa3Yua2V5LnNsaWNlKDEpLCBrdi52YWx1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAga3Yua2V5LnRvTG93ZXJDYXNlKCkgIT09ICckdmVyc2lvbicgJiZcclxuICAgICAgICB0eXBlb2Yga3YudmFsdWUgPT09ICdzdHJpbmcnXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuYWRkQ29va2llKGt2KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5hZHZhbmNlQW5kQ2hlY2tDb29raWVEZWxpbWl0ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZsdXNoQ29va2llKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2Nvb2tpZXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGFyc2VTZXRDb29raWUoc2V0Q29va2llSGVhZGVyOiBzdHJpbmcpOiBOZXR3b3JrQ29va2llW10gfCB1bmRlZmluZWQge1xyXG4gICAgaWYgKCF0aGlzLl9pbml0aWFsaXplKHNldENvb2tpZUhlYWRlcikpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGt2ID0gdGhpcy5fZXh0cmFjdEtleVZhbHVlKCk7IGt2OyBrdiA9IHRoaXMuX2V4dHJhY3RLZXlWYWx1ZSgpKSB7XHJcbiAgICAgIGlmICh0aGlzLl9sYXN0Q29va2llKSB7XHJcbiAgICAgICAgdGhpcy5fbGFzdENvb2tpZS5hZGRBdHRyaWJ1dGUoa3Yua2V5LCBrdi52YWx1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hZGRDb29raWUoa3YpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmFkdmFuY2VBbmRDaGVja0Nvb2tpZURlbGltaXRlcigpKSB7XHJcbiAgICAgICAgdGhpcy5mbHVzaENvb2tpZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmZsdXNoQ29va2llKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2Nvb2tpZXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pbml0aWFsaXplKGhlYWRlclZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIHRoaXMuX2lucHV0ID0gaGVhZGVyVmFsdWU7XHJcbiAgICBpZiAodHlwZW9mIGhlYWRlclZhbHVlICE9PSAnc3RyaW5nJykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9jb29raWVzID0gW107XHJcbiAgICB0aGlzLl9sYXN0Q29va2llID0gbnVsbDtcclxuICAgIHRoaXMuX29yaWdpbmFsSW5wdXRMZW5ndGggPSB0aGlzLl9pbnB1dC5sZW5ndGg7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZsdXNoQ29va2llKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2xhc3RDb29raWUpIHtcclxuICAgICAgdGhpcy5fbGFzdENvb2tpZS5zaXplID1cclxuICAgICAgICB0aGlzLl9vcmlnaW5hbElucHV0TGVuZ3RoIC1cclxuICAgICAgICB0aGlzLl9pbnB1dC5sZW5ndGggLVxyXG4gICAgICAgIHRoaXMuX2xhc3RDb29raWVQb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBkZWxldGUgdGhpcy5fbGFzdENvb2tpZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2V4dHJhY3RLZXlWYWx1ZSgpOiBLZXlWYWx1ZSB7XHJcbiAgICBpZiAoIXRoaXMuX2lucHV0Py5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vdGU6IFJGQ3Mgb2ZmZXIgYW4gb3B0aW9uIGZvciBxdW90ZWQgdmFsdWVzIHRoYXQgbWF5IGNvbnRhaW4gY29tbWFzIGFuZCBzZW1pY29sb25zLlxyXG4gICAgLy8gTWFueSBicm93c2Vycy9wbGF0Zm9ybXMgZG8gbm90IHN1cHBvcnQgdGhpcywgaG93ZXZlciAoc2VlIGh0dHA6Ly93ZWJraXQub3JnL2IvMTY2OTlcclxuICAgIC8vIGFuZCBodHRwOi8vY3JidWcuY29tLzEyMzYxKS4gVGhlIGxvZ2ljIGJlbG93IG1hdGNoZXMgbGF0ZXN0IHZlcnNpb25zIG9mIElFLCBGaXJlZm94LFxyXG4gICAgLy8gQ2hyb21lIGFuZCBTYWZhcmkgb24gc29tZSBvbGQgcGxhdGZvcm1zLiBUaGUgbGF0ZXN0IHZlcnNpb24gb2YgU2FmYXJpIHN1cHBvcnRzIHF1b3RlZFxyXG4gICAgLy8gY29va2llIHZhbHVlcywgdGhvdWdoLlxyXG4gICAgY29uc3Qga2V5VmFsdWVNYXRjaCA9IC9eWyBcXHRdKihbXlxccz07XSspWyBcXHRdKig/Oj1bIFxcdF0qKFteO1xcbl0qKSk/L2kuZXhlYyhcclxuICAgICAgdGhpcy5faW5wdXRcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFrZXlWYWx1ZU1hdGNoKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXN1bHQ6IEtleVZhbHVlID0ge1xyXG4gICAgICBrZXk6IHRoaXMudG9DYW1lbENhc2Uoa2V5VmFsdWVNYXRjaFsxXSksXHJcbiAgICAgIHZhbHVlOiBrZXlWYWx1ZU1hdGNoWzJdPy50cmltKCksXHJcbiAgICAgIHBvc2l0aW9uOiB0aGlzLl9vcmlnaW5hbElucHV0TGVuZ3RoIC0gdGhpcy5faW5wdXQubGVuZ3RoXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2Uoa2V5VmFsdWVNYXRjaFswXS5sZW5ndGgpO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvQ2FtZWxDYXNlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBzdHJcclxuICAgICAgLnJlcGxhY2UoL1xccyguKS9nLCAoJDE6IHN0cmluZykgPT4gJDEudG9VcHBlckNhc2UoKSlcclxuICAgICAgLnJlcGxhY2UoL1xccy9nLCAnJylcclxuICAgICAgLnJlcGxhY2UoL14oLikvLCAoJDE6IHN0cmluZykgPT4gJDEudG9Mb3dlckNhc2UoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFkdmFuY2VBbmRDaGVja0Nvb2tpZURlbGltaXRlcigpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCB1bmRlZmluZWQgPSAvXlxccypbXFxuO11cXHMqLy5leGVjKHRoaXMuX2lucHV0KTtcclxuXHJcbiAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XHJcblxyXG4gICAgcmV0dXJuIG1hdGNoWzBdLm1hdGNoKCdcXG4nKSAhPT0gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkQ29va2llKGtleVZhbHVlOiBLZXlWYWx1ZSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX2xhc3RDb29raWUpIHtcclxuICAgICAgdGhpcy5fbGFzdENvb2tpZS5zaXplID0ga2V5VmFsdWUucG9zaXRpb24gLSB0aGlzLl9sYXN0Q29va2llUG9zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fbGFzdENvb2tpZSA9XHJcbiAgICAgIHR5cGVvZiBrZXlWYWx1ZS52YWx1ZSA9PT0gJ3N0cmluZydcclxuICAgICAgICA/IG5ldyBOZXR3b3JrQ29va2llKGtleVZhbHVlLmtleSwga2V5VmFsdWUudmFsdWUpXHJcbiAgICAgICAgOiBuZXcgTmV0d29ya0Nvb2tpZSgnJywga2V5VmFsdWUua2V5KTtcclxuXHJcbiAgICB0aGlzLl9sYXN0Q29va2llUG9zaXRpb24gPSBrZXlWYWx1ZS5wb3NpdGlvbjtcclxuICAgIHRoaXMuX2Nvb2tpZXMucHVzaCh0aGlzLl9sYXN0Q29va2llKTtcclxuICB9XHJcbn1cclxuIl19