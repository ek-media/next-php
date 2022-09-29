import { exec } from "./utils";
import { existsSync } from 'fs';

type PhpVersion = {
    version: number,
    bin: string
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
    return (await exec(`powershell -command "gcm php | Format-Table Name, Version, Definition"`))
        .split('\r\n')
        .filter(row => row.startsWith('php'))
        .map(row => row.split(' '))
        .filter(row => row.length === 3)
        .map(row => ({
            version: parseFloat(row[1]),
            bin: row[2]
        }))
}

async function linux(): Promise<PhpVersion[]> {
    const test = await exec(`ls /usr/local/php*`);
    console.log(test)
    return []
}