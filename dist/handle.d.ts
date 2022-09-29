import type { IncomingMessage, ServerResponse } from "http";
import type { ActivePhpVersion } from "./version";
export declare function handle(php: ActivePhpVersion): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
