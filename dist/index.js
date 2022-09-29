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
const handle_1 = require("./handle");
const version_1 = require("./version");
const http_1 = require("http");
function NextPHP(config = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let php;
        if (config.version) {
            const installedVersions = yield (0, version_1.getVersions)();
            const selection = installedVersions.filter(item => item.version === ((typeof config.version === "string") ? parseFloat(config.version) : config.version));
            if (selection.length === 0) {
                console.error(`Cannot retrieve PHP version ${config.version}, please select one of these versions: ${installedVersions.map(version => version.version).join(', ')}.`);
                process.exit(1);
            }
            php = {
                bin: (selection[0].cgi_path || selection[0].cli_path),
                mode: (selection[0].cgi_path ? 'cgi' : 'cli'),
                version: selection[0].version,
                is_default: false
            };
        }
        else {
            const default_version = yield (0, version_1.getDefaultVersion)();
            if (!default_version) {
                try {
                    const installedVersions = yield (0, version_1.getVersions)();
                    console.error(`Cannot retrieve default PHP version, please select one of these versions: ${installedVersions.map(version => version.version).join(', ')}.`);
                    process.exit(1);
                }
                catch (e) {
                    console.log(e);
                    console.error('Cannot retrieve PHP versions, please check if PHP is installed on your system.');
                    process.exit(1);
                }
            }
            php = {
                bin: ((typeof default_version.cgi_path !== "undefined") ? default_version.cgi_path : default_version.cli_path),
                mode: (typeof default_version.cgi_path !== "undefined") ? 'cgi' : 'cli',
                version: default_version.version,
                is_default: true
            };
        }
        console.log(`> Using PHP ${php.version} (${php.mode})${php.is_default ? ` <- default version` : ''} <`);
        return {
            handle: (0, handle_1.handle)(php),
            version: php.version,
            bin: php.bin,
            mode: php.mode
        };
    });
}
exports.default = NextPHP;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const php = yield NextPHP();
    (0, http_1.createServer)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield php.handle(req, res);
    })).listen(3333);
}))();
