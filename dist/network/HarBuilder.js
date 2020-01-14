"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const EntryBuilder_1 = require("./EntryBuilder");
class HarBuilder {
    constructor(chromeRequests) {
        this.chromeRequests = chromeRequests;
    }
    build() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { name, version, homepage: comment } = require('../../package.json');
            const entries = yield Promise.all(this.chromeRequests.map((request) => new EntryBuilder_1.EntryBuilder(request).build()));
            return {
                log: {
                    version: '1.2',
                    pages: [],
                    creator: {
                        name,
                        version,
                        comment
                    },
                    entries
                }
            };
        });
    }
}
exports.HarBuilder = HarBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFyQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9uZXR3b3JrL0hhckJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsaURBQThDO0FBRTlDLE1BQWEsVUFBVTtJQUNyQixZQUE2QixjQUFnQztRQUFoQyxtQkFBYyxHQUFkLGNBQWMsQ0FBa0I7SUFBRyxDQUFDO0lBRXBELEtBQUs7O1lBQ2hCLDhEQUE4RDtZQUM5RCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFM0UsTUFBTSxPQUFPLEdBQVksTUFBTSxPQUFPLENBQUMsR0FBRyxDQUN4QyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxDQUNsRCxJQUFJLDJCQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ2xDLENBQ0YsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsR0FBRyxFQUFFO29CQUNILE9BQU8sRUFBRSxLQUFLO29CQUNkLEtBQUssRUFBRSxFQUFFO29CQUNULE9BQU8sRUFBRTt3QkFDUCxJQUFJO3dCQUNKLE9BQU87d0JBQ1AsT0FBTztxQkFDUjtvQkFDRCxPQUFPO2lCQUNSO2FBQ0YsQ0FBQztRQUNKLENBQUM7S0FBQTtDQUNGO0FBMUJELGdDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVudHJ5LCBIYXIgfSBmcm9tICdoYXItZm9ybWF0JztcclxuaW1wb3J0IHsgTmV0d29ya1JlcXVlc3QgfSBmcm9tICcuL05ldHdvcmtSZXF1ZXN0JztcclxuaW1wb3J0IHsgRW50cnlCdWlsZGVyIH0gZnJvbSAnLi9FbnRyeUJ1aWxkZXInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhhckJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY2hyb21lUmVxdWVzdHM6IE5ldHdvcmtSZXF1ZXN0W10pIHt9XHJcblxyXG4gIHB1YmxpYyBhc3luYyBidWlsZCgpOiBQcm9taXNlPEhhcj4ge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcclxuICAgIGNvbnN0IHsgbmFtZSwgdmVyc2lvbiwgaG9tZXBhZ2U6IGNvbW1lbnQgfSA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xyXG5cclxuICAgIGNvbnN0IGVudHJpZXM6IEVudHJ5W10gPSBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgdGhpcy5jaHJvbWVSZXF1ZXN0cy5tYXAoKHJlcXVlc3Q6IE5ldHdvcmtSZXF1ZXN0KSA9PlxyXG4gICAgICAgIG5ldyBFbnRyeUJ1aWxkZXIocmVxdWVzdCkuYnVpbGQoKVxyXG4gICAgICApXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxvZzoge1xyXG4gICAgICAgIHZlcnNpb246ICcxLjInLFxyXG4gICAgICAgIHBhZ2VzOiBbXSxcclxuICAgICAgICBjcmVhdG9yOiB7XHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgdmVyc2lvbixcclxuICAgICAgICAgIGNvbW1lbnRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudHJpZXNcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuIl19