import { exec } from "./utils";
import { existsSync } from 'fs';

type PhpVersion = {
    version: number,
    cli_path?: string,
    cgi_path?: string
}

export async function retrievePHPVersions(): Promise<PhpVersion[]> {
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

async function win32(): Promise<PhpVersion[]> {
    const cli = (await exec(`powershell -command "gcm php | Format-Table Name, Version, Definition"`))
        .split('\r\n')
        .filter(row => row.startsWith('php'))
        .map(row => row.split(' '))
        .filter(row => row.length === 3)
        .map(row => ({
            version: parseFloat(row[1]),
            cli_path: row[2]
        }));

    
    const cgi = (await exec(`powershell -command "gcm php-cgi | Format-Table Name, Version, Definition"`))
        .split('\r\n')
        .filter(row => row.startsWith('php'))
        .map(row => row.split(' '))
        .filter(row => row.length === 3)
        .map(row => ({
            version: parseFloat(row[1]),
            cgi_path: row[2]
        }));
        
    const temp_versions: Record<string, { cgi_path?: string, cli_path?: string }> = {};

    for(const element of [...cli, ...cgi]) {
        if(typeof temp_versions[element.version.toString()] === "undefined")
            temp_versions[element.version.toString()] = {
                cgi_path: (element as any).cgi_path,
                cli_path: (element as any).cli_path
            }
        else
            temp_versions[element.version.toString()] = {
                cgi_path: temp_versions[element.version.toString()].cgi_path || (element as any).cgi_path,
                cli_path: temp_versions[element.version.toString()].cli_path || (element as any).cli_path
            }
    }

    return Object.entries(temp_versions)
        .map(([version, info]) => ({
            version: parseFloat(version),
            ...info
        }));
}

async function linux(): Promise<PhpVersion[]> {
    const test = (await exec(`ls /usr/local/php*/bin`))
        .split('\r\n\r\n');
    console.log(test)
    return []
}