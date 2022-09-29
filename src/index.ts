import type { NextServer } from 'next/dist/server/next';
import { retrievePHPVersions } from './version';

type NextPHPConfig = {
    port: number,
    host?: string
}

export default async function NextPHP(app: NextServer) {
    
}

(async () => {
    const versions = await retrievePHPVersions()
    console.log(versions)
})()