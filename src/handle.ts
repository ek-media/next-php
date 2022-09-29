import type { IncomingMessage, ServerResponse } from "http";
import { join } from "path";
import { exec } from "./utils";
import type { ActivePhpVersion } from "./version";
import { parse } from 'url';

export function handle(php: ActivePhpVersion) {
    return async function(req: IncomingMessage, res: ServerResponse) {
        const url = parse(req.url || '');
        const ip: string = req.socket.remoteAddress || '';
        try {
            const test = await exec([
                php.bin,
                join(__dirname, '../loader.php'),
                Buffer.from(JSON.stringify({
                    pathname: url.pathname,
                    query: url.query,
                    method: req.method?.toUpperCase() || 'GET',
                    ip: (ip.startsWith('::ffff:') ? ip.substring('::ffff:'.length) : ip),
                    headers: req.headers
                })).toString('base64')
            ].join(' '));
            res.end(test);
        } catch(e) {
            res.statusCode = 500;
            res.end(e);
        }
    }
}