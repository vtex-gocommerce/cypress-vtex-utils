"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class Logger {
    static get Instance() {
        if (!this._instance) {
            this._instance = new Logger();
        }
        return this._instance;
    }
    info(msg) {
        this.log(chalk_1.default.blue(`🛈 ${msg}`));
    }
    err(msg) {
        this.log(chalk_1.default.red(`🍑 ${msg}`));
    }
    warn(msg) {
        this.log(chalk_1.default.yellow(`⚠ ${msg}`));
    }
    log(msg) {
        // eslint-disable-next-line no-console
        console.log(msg);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL0xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwREFBMEI7QUFFMUIsTUFBYSxNQUFNO0lBR2pCLE1BQU0sS0FBSyxRQUFRO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztTQUMvQjtRQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBRU0sSUFBSSxDQUFDLEdBQVc7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxHQUFHLENBQUMsR0FBVztRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLElBQUksQ0FBQyxHQUFXO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU8sR0FBRyxDQUFDLEdBQVc7UUFDckIsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztDQUNGO0FBM0JELHdCQTJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XHJcblxyXG5leHBvcnQgY2xhc3MgTG9nZ2VyIHtcclxuICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IExvZ2dlcjtcclxuXHJcbiAgc3RhdGljIGdldCBJbnN0YW5jZSgpOiBMb2dnZXIge1xyXG4gICAgaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xyXG4gICAgICB0aGlzLl9pbnN0YW5jZSA9IG5ldyBMb2dnZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5faW5zdGFuY2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaW5mbyhtc2c6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2coY2hhbGsuYmx1ZShg8J+biCAke21zZ31gKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZXJyKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLmxvZyhjaGFsay5yZWQoYPCfjZEgJHttc2d9YCkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHdhcm4obXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMubG9nKGNoYWxrLnllbGxvdyhg4pqgICR7bXNnfWApKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9nKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgY29uc29sZS5sb2cobXNnKTtcclxuICB9XHJcbn1cclxuIl19