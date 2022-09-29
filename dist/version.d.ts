declare type PhpVersion = {
    version: number;
    cli_path?: string;
    cgi_path?: string;
};
export declare type ActivePhpVersion = {
    version: number;
    mode: 'cli' | 'cgi';
    bin: string;
    is_default: boolean;
};
export declare function getVersions(): Promise<PhpVersion[]>;
export declare function checkPHPVersion(bin: string): Promise<ActivePhpVersion | undefined>;
export declare function getDefaultVersion(): Promise<PhpVersion | undefined>;
export {};
