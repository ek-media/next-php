import { exec as NodeExec } from 'child_process';

export async function exec(...command: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        NodeExec(command.join(' '), (error, stdout) => {
            if(error) return reject(error);
            return resolve(stdout);
        })
    })
}