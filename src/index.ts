import { handle } from "./handle";
import { ActivePhpVersion, checkPHPVersion, getDefaultVersion, getVersions } from "./version";

type NextPHPConfig = {
    version?: string | number,
    bin?: string
}

export default async function NextPHP(config: NextPHPConfig = {}) {
    let php: ActivePhpVersion;
    if(config.bin) {
        const selectedBin = await checkPHPVersion(config.bin as string);
        if(typeof selectedBin === "undefined") {
            console.error(`The selected executable is not a valid PHP executable (${config.bin}).`);
            process.exit(1);
        }
        php = selectedBin;
    } else if(config.version) {
        const installedVersions = await getVersions();
        const selection = installedVersions.filter(item => item.version === ((typeof config.version === "string") ? parseFloat(config.version) : config.version));
        if(selection.length === 0) {
            console.error(`Cannot retrieve PHP version ${config.version}, please select one of these versions: ${installedVersions.map(version => version.version).join(', ')}.`);
            process.exit(1);
        }
        php = {
            bin: (selection[0].cgi_path || selection[0].cli_path) as string,
            mode: (selection[0].cgi_path ? 'cgi' : 'cli'),
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
                console.log(e)
                console.error('Cannot retrieve PHP versions, please check if PHP is installed on your system.');
                process.exit(1);
            }
        }
        php = {
            bin: ((typeof default_version.cgi_path !== "undefined") ? default_version.cgi_path : default_version.cli_path) as string,
            mode: (typeof default_version.cgi_path !== "undefined") ? 'cgi' : 'cli',
            version: default_version.version,
            is_default: true
        }
    }

    console.log(`> Using PHP ${php.version} (${php.mode})${php.is_default ? ` <- default version` : ''} <`);

    return {
        handle: handle(php),
        version: php.version,
        bin: php.bin,
        mode: php.mode
    }
}
