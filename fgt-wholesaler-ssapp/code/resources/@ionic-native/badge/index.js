var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { IonicNativePlugin, cordova } from '@ionic-native/core';
var BadgeOriginal = /** @class */ (function (_super) {
    __extends(BadgeOriginal, _super);
    function BadgeOriginal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BadgeOriginal.prototype.clear = function () { return cordova(this, "clear", {}, arguments); };
    BadgeOriginal.prototype.set = function (badgeNumber) { return cordova(this, "set", {}, arguments); };
    BadgeOriginal.prototype.get = function () { return cordova(this, "get", {}, arguments); };
    BadgeOriginal.prototype.increase = function (increaseBy) { return cordova(this, "increase", {}, arguments); };
    BadgeOriginal.prototype.decrease = function (decreaseBy) { return cordova(this, "decrease", {}, arguments); };
    BadgeOriginal.prototype.isSupported = function () { return cordova(this, "isSupported", {}, arguments); };
    BadgeOriginal.prototype.hasPermission = function () { return cordova(this, "hasPermission", {}, arguments); };
    BadgeOriginal.prototype.requestPermission = function () { return cordova(this, "requestPermission", {}, arguments); };
    BadgeOriginal.pluginName = "Badge";
    BadgeOriginal.plugin = "cordova-plugin-badge";
    BadgeOriginal.pluginRef = "cordova.plugins.notification.badge";
    BadgeOriginal.repo = "https://github.com/katzer/cordova-plugin-badge";
    BadgeOriginal.platforms = ["Android", "Browser", "iOS", "Windows"];
    return BadgeOriginal;
}(IonicNativePlugin));
var Badge = new BadgeOriginal();
export { Badge };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvQGlvbmljLW5hdGl2ZS9wbHVnaW5zL2JhZGdlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLDhCQUFzQyxNQUFNLG9CQUFvQixDQUFDOztJQWlDN0MseUJBQWlCOzs7O0lBTTFDLHFCQUFLO0lBVUwsbUJBQUcsYUFBQyxXQUFtQjtJQVN2QixtQkFBRztJQVVILHdCQUFRLGFBQUMsVUFBa0I7SUFVM0Isd0JBQVEsYUFBQyxVQUFrQjtJQVMzQiwyQkFBVztJQVNYLDZCQUFhO0lBU2IsaUNBQWlCOzs7Ozs7Z0JBMUduQjtFQWtDMkIsaUJBQWlCO1NBQS9CLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb3Jkb3ZhLCBJb25pY05hdGl2ZVBsdWdpbiwgUGx1Z2luIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9jb3JlJztcblxuLyoqXG4gKiBAbmFtZSBCYWRnZVxuICogQHByZW1pZXIgYmFkZ2VcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGVzc2VudGlhbCBwdXJwb3NlIG9mIGJhZGdlIG51bWJlcnMgaXMgdG8gZW5hYmxlIGFuIGFwcGxpY2F0aW9uIHRvIGluZm9ybSBpdHMgdXNlcnMgdGhhdCBpdCBoYXMgc29tZXRoaW5nIGZvciB0aGVtIOKAlCBmb3IgZXhhbXBsZSwgdW5yZWFkIG1lc3NhZ2VzIOKAlCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpc27igJl0IHJ1bm5pbmcgaW4gdGhlIGZvcmVncm91bmQuXG4gKlxuICogUmVxdWlyZXMgQ29yZG92YSBwbHVnaW46IGNvcmRvdmEtcGx1Z2luLWJhZGdlLiBGb3IgbW9yZSBpbmZvLCBwbGVhc2Ugc2VlIHRoZSBbQmFkZ2UgcGx1Z2luIGRvY3NdKGh0dHBzOi8vZ2l0aHViLmNvbS9rYXR6ZXIvY29yZG92YS1wbHVnaW4tYmFkZ2UpLlxuICpcbiAqIEFuZHJvaWQgTm90ZTogQmFkZ2VzIGhhdmUgaGlzdG9yaWNhbGx5IG9ubHkgYmVlbiBhIGZlYXR1cmUgaW1wbGVtZW50ZWQgYnkgdGhpcmQgcGFydHkgbGF1bmNoZXJzIGFuZCBub3QgdmlzaWJsZSB1bmxlc3Mgb25lIG9mIHRob3NlIGxhdW5jaGVycyB3YXMgYmVpbmcgdXNlZCAoRS5HLiBTYW1zdW5nIG9yIE5vdmEgTGF1bmNoZXIpIGFuZCBpZiBlbmFibGVkIGJ5IHRoZSB1c2VyLiBBcyBvZiBBbmRyb2lkIDggKE9yZW8pLCBbbm90aWZpY2F0aW9uIGJhZGdlc10oaHR0cHM6Ly9kZXZlbG9wZXIuYW5kcm9pZC5jb20vdHJhaW5pbmcvbm90aWZ5LXVzZXIvYmFkZ2VzKSB3ZXJlIGludHJvZHVjZWQgb2ZmaWNpYWxseSB0byByZWZsZWN0IHVucmVhZCBub3RpZmljYXRpb25zLiBUaGlzIHBsdWdpbiBpcyB1bmxpa2VseSB0byB3b3JrIGFzIGV4cGVjdGVkIG9uIGRldmljZXMgcnVubmluZyBBbmRyb2lkIDggb3IgbmV3ZXIuIFBsZWFzZSBzZWUgdGhlIFtsb2NhbCBub3RpZmljYXRpb25zIHBsdWdpbiBkb2NzXShodHRwczovL2dpdGh1Yi5jb20va2F0emVyL2NvcmRvdmEtcGx1Z2luLWxvY2FsLW5vdGlmaWNhdGlvbnMpIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGJhZGdlIHVzZSB3aXRoIG5vdGlmaWNhdGlvbnMuXG4gKlxuICogQHVzYWdlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBCYWRnZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvYmFkZ2Uvbmd4JztcbiAqXG4gKiBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhZGdlOiBCYWRnZSkgeyB9XG4gKlxuICogLi4uXG4gKlxuICogdGhpcy5iYWRnZS5zZXQoMTApO1xuICogdGhpcy5iYWRnZS5pbmNyZWFzZSgxKTtcbiAqIHRoaXMuYmFkZ2UuY2xlYXIoKTtcbiAqIGBgYFxuICovXG5AUGx1Z2luKHtcbiAgcGx1Z2luTmFtZTogJ0JhZGdlJyxcbiAgcGx1Z2luOiAnY29yZG92YS1wbHVnaW4tYmFkZ2UnLFxuICBwbHVnaW5SZWY6ICdjb3Jkb3ZhLnBsdWdpbnMubm90aWZpY2F0aW9uLmJhZGdlJyxcbiAgcmVwbzogJ2h0dHBzOi8vZ2l0aHViLmNvbS9rYXR6ZXIvY29yZG92YS1wbHVnaW4tYmFkZ2UnLFxuICBwbGF0Zm9ybXM6IFsnQW5kcm9pZCcsICdCcm93c2VyJywgJ2lPUycsICdXaW5kb3dzJ10sXG59KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJhZGdlIGV4dGVuZHMgSW9uaWNOYXRpdmVQbHVnaW4ge1xuICAvKipcbiAgICogQ2xlYXIgdGhlIGJhZGdlIG9mIHRoZSBhcHAgaWNvbi5cbiAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XG4gICAqL1xuICBAQ29yZG92YSgpXG4gIGNsZWFyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGJhZGdlIG9mIHRoZSBhcHAgaWNvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJhZGdlTnVtYmVyICBUaGUgbmV3IGJhZGdlIG51bWJlci5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIEBDb3Jkb3ZhKClcbiAgc2V0KGJhZGdlTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGJhZGdlIG9mIHRoZSBhcHAgaWNvbi5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIEBDb3Jkb3ZhKClcbiAgZ2V0KCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY3JlYXNlIHRoZSBiYWRnZSBudW1iZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmNyZWFzZUJ5ICBDb3VudCB0byBhZGQgdG8gdGhlIGN1cnJlbnQgYmFkZ2UgbnVtYmVyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAqL1xuICBAQ29yZG92YSgpXG4gIGluY3JlYXNlKGluY3JlYXNlQnk6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY3JlYXNlIHRoZSBiYWRnZSBudW1iZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWNyZWFzZUJ5ICBDb3VudCB0byBzdWJ0cmFjdCBmcm9tIHRoZSBjdXJyZW50IGJhZGdlIG51bWJlclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgKi9cbiAgQENvcmRvdmEoKVxuICBkZWNyZWFzZShkZWNyZWFzZUJ5OiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBzdXBwb3J0IHRvIHNob3cgYmFkZ2VzLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgKi9cbiAgQENvcmRvdmEoKVxuICBpc1N1cHBvcnRlZCgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIGFwcCBoYXMgcGVybWlzc2lvbiB0byBzaG93IGJhZGdlcy5cbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAgICovXG4gIEBDb3Jkb3ZhKClcbiAgaGFzUGVybWlzc2lvbigpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBwZXJtaXNzaW9uIHRvIHNldCBiYWRnZSBub3RpZmljYXRpb25zXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAqL1xuICBAQ29yZG92YSgpXG4gIHJlcXVlc3RQZXJtaXNzaW9uKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuO1xuICB9XG59XG4iXX0=