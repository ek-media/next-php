import { exec } from "./utils";

type PhpVersion = {
    version: number,
    cli_path?: string,
    cgi_path?: string
}

export type ActivePhpVersion = {
    version: number,
    mode: 'cli' | 'cgi',
    bin: string,
    is_default: boolean
}

export async function getVersions(): Promise<PhpVersion[]> {
    switch(process.platform) {
        case 'win32':
            return await win32();
        case 'linux':
        case 'android':
        case 'darwin':
            return await linux();
        default:
            throw new Error('Platform not supported by NextJS php extension');
    }
}

export async function getDefaultVersion(): Promise<PhpVersion | undefined> {
    let version: Partial<PhpVersion> = {};

    try {
        const cgi_version = await exec(`php-cgi -v`);
        const match = cgi_version.match(/PHP ([0-9]\.[0-9]\.[0-9])/);
        if(match) {
            version.version = parseFloat(match[1]);
            version.cgi_path = 'php-cgi';
        }
    } catch(e) {}

    try {
        const cli_version = await exec(`php -v`);
        const match = cli_version.match(/PHP ([0-9]\.[0-9]\.[0-9])/);
        if(match) {
            if(!version.version) {
                version.version = parseFloat(match[1]);
                version.cgi_path = 'php';
            } else {
                if(version.version === parseFloat(match[1]))
                    version.cgi_path = 'php';
            }
        }
    } catch(e) {}

    if(!version.version) return undefined;
    return version as PhpVersion;
}

async function win32(): Promise<PhpVersion[]> {
    const defaultVersion = await getDefaultVersion();
    if(!defaultVersion) return [];
    return [defaultVersion];
}

async function linux(): Promise<PhpVersion[]> {
    return ((await exec(`ls /usr/local/php*/bin`))
        .replace(/\r\n/g, '\n')
        .split(/\n\n/)
        .map(row => row.split('\n').map(item => item.replace(/[\n]/g, '')))
        .map(row => {
            const version_match = row[0].match(/(php[0-9]{0,3})/);
            if(!version_match || version_match.length === 0)
                return null;
            return {
                version: parseFloat(version_match[0].substring(3).split('').join('.')),
                cgi_path: (row.includes('php-cgi') ? `/usr/local/${version_match[0]}/bin/php-cgi` : undefined),
                cli_path: (row.includes('php') ? `/usr/local/${version_match[0]}/bin/php` : undefined),
            }
        })
        .filter(row => row !== null) as PhpVersion[]);
}