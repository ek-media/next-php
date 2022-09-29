"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = void 0;
const path_1 = require("path");
const utils_1 = require("./utils");
const url_1 = require("url");
function handle(php) {
    return function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = (0, url_1.parse)(req.url || '');
            const ip = req.socket.remoteAddress || '';
            const payload = Buffer.from(JSON.stringify({
                pathname: url.pathname,
                query: url.query,
                method: ((_a = req.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'GET',
                ip: (ip.startsWith('::ffff:') ? ip.substring('::ffff:'.length) : ip),
                headers: req.headers,
                document_root: process.cwd()
            })).toString('base64');
            function execPHP(command) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (php.mode === 'cgi') {
                        const res = yield (0, utils_1.exec)([
                            php.bin,
                            command,
                            `NEXTJS_PAYLOAD="${payload}"`
                        ]);
                        return res.split(/\n\n/)[1];
                    }
                    else
                        return yield (0, utils_1.exec)([
                            php.bin,
                            command,
                            payload
                        ]);
                });
            }
            try {
                const test = yield execPHP((0, path_1.join)(__dirname, '../loader.php'));
                res.end(test);
            }
            catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify(e));
                console.log(e);
            }
        });
    };
}
exports.handle = handle;
