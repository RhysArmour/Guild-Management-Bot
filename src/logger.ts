import pino from 'pino';

export const Logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      ignore: 'hostname,pid',
    },
  },
});
