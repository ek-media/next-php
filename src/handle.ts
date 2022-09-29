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
            headers: req.headers
        })).toString('base64');
        try {
            const test = await exec([
                `NEXT_PHP_PAYLOAD="${payload}"`,
                php.bin,
                join(__dirname, '../loader.php')
            ].join(' '));
            res.end(test);
        } catch(e) {
            res.statusCode = 500;
            res.end(JSON.stringify(e));
        }
    }
}