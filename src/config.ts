import dotenv from 'dotenv'
dotenv.config()
const {guildId, token, clientId} = process.env

if(!clientId || !guildId || !token) {
    throw new Error('Missing environment variable')
}

const config: Record<string, string> = {
    clientId,
    guildId,
    token
}

export default config;