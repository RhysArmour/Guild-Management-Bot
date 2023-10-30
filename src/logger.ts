import pino from 'pino'
import { SonicBoom } from 'sonic-boom'

export const Logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "hostname,pid",
        },
        sync: false
    },
    destination: new SonicBoom({ dest: '../logs', mkdir: true })
})