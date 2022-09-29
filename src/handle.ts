import type { IncomingMessage, ServerResponse } from "http";
import { join } from "path";
import { exec } from "./utils";
import type { ActivePhpVersion } from "./version";
import { parse } from 'url';

export function handle(php: ActivePhpVersion) {
    return async function(req: IncomingMessage, res: ServerResponse) {
        const url = parse(req.url || '');
        const ip: string = req.socket.remoteAddress || '';
        const payload = Buffer.from(JSON.stringify({
            pathname: url.pathname,
            query: url.query,
            method: req.method?.toUpperCase() || 'GET',
            ip: (ip.startsWith('::ffff:') ? ip.substring('::ffff:'.length) : ip),
            headers: req.headers,
            document_root: process.cwd()
        })).toString('base64');

        async function execPHP(command: string) {
            if(php.mode === 'cgi') {
                const res = await exec([
                    php.bin,
                    command,
                    `NEXTJS_PAYLOAD="${payload}"`
                ]);
                return res.split(/\n\n/)[1];
            } else
                return await exec([
                    php.bin,
                    command,
                    payload
                ])
        }

        try {
            const test = await execPHP(join(__dirname, '../loader.php'));
            res.end(test);
        } catch(e) {
            res.statusCode = 500;
            res.end(JSON.stringify(e));
            console.log(e);
        }
    }
}