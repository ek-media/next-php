import { retrievePHPVersions } from './version';

type NextPHPConfig = {
    port: number,
    host?: string
}

export default async function NextPHP() {
    
}

(async () => {
    const versions = await retrievePHPVersions()
    console.log(versions)
})()