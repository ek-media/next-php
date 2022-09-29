/// <reference types="node" />
declare type NextPHPConfig = {
    version?: string | number;
};
export default function NextPHP(config?: NextPHPConfig): Promise<{
    handle: (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>) => Promise<void>;
    version: number;
    bin: string;
    mode: "cli" | "cgi";
}>;
export {};
