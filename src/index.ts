import { getDefaultVersion, getVersions } from "./version"

type NextPHPConfig = {
    version?: string | number
}

export default async function NextPHP(config: NextPHPConfig = {}) {
    let exec: { type: 'cgi' | 'cli', bin: string, version: number, is_default: boolean };
    if(config.version) {
        const installedVersions = await getVersions();
        const selection = installedVersions.filter(item => item.version === ((typeof config.version === "string") ? parseFloat(config.version) : config.version));
        if(selection.length === 0) {
            console.error(`Cannot retrieve PHP version ${config.version}, please select one of these versions: ${installedVersions.map(version => version.version).join(', ')}.`);
            process.exit(1);
        }
        exec = {
            bin: (selection[0].cgi_path || selection[0].cli_path) as string,
            type: (selection[0].cgi_path ? 'cgi' : 'cli'),
            version: selection[0].version,
            is_default: false
        }
    } else {
        const default_version = await getDefaultVersion();
        if(!default_version) {
            try {
                const installedVersions = await getVersions();
                console.error(`Cannot retrieve default PHP version, please select one of these versions: ${installedVersions.map(version => version.version).join(', ')}.`);
                process.exit(1);
            } catch(e) {
                console.error('Cannot retrieve PHP versions, please check if PHP is installed on your system.');
                process.exit(1);
            }
        }
        exec = {
            bin: ((typeof default_version.cgi_path !== "undefined") ? default_version.cgi_path : default_version.cli_path) as string,
            type: (typeof default_version.cgi_path !== "undefined") ? 'cgi' : 'cli',
            version: default_version.version,
            is_default: true
        }
    }

    console.log(`> Using PHP ${exec.version} (${exec.type})${exec.is_default ? ` <- default version` : ''}`);
}

(async () => {
    const php = await NextPHP();
})()