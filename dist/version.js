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
exports.getDefaultVersion = exports.getVersions = void 0;
const utils_1 = require("./utils");
function getVersions() {
    return __awaiter(this, void 0, void 0, function* () {
        switch (process.platform) {
            case 'win32':
                return yield win32();
            case 'linux':
            case 'android':
            case 'darwin':
                return yield linux();
            default:
                throw new Error('Platform not supported by NextJS php extension');
        }
    });
}
exports.getVersions = getVersions;
function getDefaultVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        let version = {};
        try {
            const cgi_version = yield (0, utils_1.exec)(`php-cgi -v`);
            const match = cgi_version.match(/PHP ([0-9]\.[0-9]\.[0-9])/);
            if (match) {
                version.version = parseFloat(match[1]);
                version.cgi_path = 'php-cgi';
            }
        }
        catch (e) { }
        try {
            const cli_version = yield (0, utils_1.exec)(`php -v`);
            const match = cli_version.match(/PHP ([0-9]\.[0-9]\.[0-9])/);
            if (match) {
                if (!version.version) {
                    version.version = parseFloat(match[1]);
                    version.cgi_path = 'php';
                }
                else {
                    if (version.version === parseFloat(match[1]))
                        version.cgi_path = 'php';
                }
            }
        }
        catch (e) { }
        if (!version.version)
            return undefined;
        return version;
    });
}
exports.getDefaultVersion = getDefaultVersion;
function win32() {
    return __awaiter(this, void 0, void 0, function* () {
        const cli = (yield (0, utils_1.exec)(`powershell -command "gcm php | Format-Table Name, Version, Definition"`))
            .split('\r\n')
            .filter(row => row.startsWith('php'))
            .map(row => row.split(' '))
            .filter(row => row.length === 3)
            .map(row => ({
            version: parseFloat(row[1]),
            cli_path: row[2]
        }));
        const cgi = (yield (0, utils_1.exec)(`powershell -command "gcm php-cgi | Format-Table Name, Version, Definition"`))
            .split('\r\n')
            .filter(row => row.startsWith('php'))
            .map(row => row.split(' '))
            .filter(row => row.length === 3)
            .map(row => ({
            version: parseFloat(row[1]),
            cgi_path: row[2]
        }));
        const temp_versions = {};
        for (const element of [...cli, ...cgi]) {
            if (typeof temp_versions[element.version.toString()] === "undefined")
                temp_versions[element.version.toString()] = {
                    cgi_path: element.cgi_path,
                    cli_path: element.cli_path
                };
            else
                temp_versions[element.version.toString()] = {
                    cgi_path: temp_versions[element.version.toString()].cgi_path || element.cgi_path,
                    cli_path: temp_versions[element.version.toString()].cli_path || element.cli_path
                };
        }
        return Object.entries(temp_versions)
            .map(([version, info]) => (Object.assign({ version: parseFloat(version) }, info)));
    });
}
function linux() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield (0, utils_1.exec)(`ls /usr/local/php*/bin`))
            .replace(/\r\n/g, '\n')
            .split(/\n\n/)
            .map(row => row.split('\n').map(item => item.replace(/[\n]/g, '')))
            .map(row => {
            const version_match = row[0].match(/(php[0-9]{0,3})/);
            if (!version_match || version_match.length === 0)
                return null;
            return {
                version: parseFloat(version_match[0].substring(3).split('').join('.')),
                cgi_path: (row.includes('php-cgi') ? `/usr/local/${version_match[0]}/bin/php-cgi` : undefined),
                cli_path: (row.includes('php') ? `/usr/local/${version_match[0]}/bin/php` : undefined),
            };
        })
            .filter(row => row !== null);
    });
}
