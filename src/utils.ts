import { exec as NodeExec } from 'child_process';

export async function exec(command: string[] | string): Promise<string> {
    return new Promise((resolve, reject) => {
        NodeExec((Array.isArray(command) ? command.join(' ') : command), (error, stdout) => {
            if(error) return reject(error);
            return resolve(stdout);
        })
    })
}