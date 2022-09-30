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
                return res.split('\r\n\r\n')[1];
            } else
                return await exec([
                    php.bin,
                    command,
                    payload
                ])
        }

        try {
            const output = JSON.parse(await execPHP(join(__dirname, '../loader.php')));
            if(output.success) {
                res.statusCode = output.response.status;
                for(const header in output.response.headers)
                    res.setHeader(header, output.response.headers[header]);
                res.end(JSON.stringify({
                    success: true,
                    code: 200,
                    error: null,
                    data: output.output
                }));
            } else {
                res.statusCode = 500;
                res.end(JSON.stringify({
                    success: false,
                    code: 500,
                    error: {
                        code: output.error.code,
                        message: output.error.message
                    },
                    data: null
                }));
            }
        } catch(e) {
            res.statusCode = 500;
            res.end(JSON.stringify({
                success: false,
                code: 500,
                error: {
                    code: 500,
                    message: 'Internal server error'
                },
                data: null
            }));
        }
    }
}