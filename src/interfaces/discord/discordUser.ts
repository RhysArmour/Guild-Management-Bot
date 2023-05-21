import { Snowflake } from "discord.js"

export interface DiscordUser {
    id: Snowflake,
    username: string,
    discriminator: string,
    avatar: string,
    bot?: boolean
    system?: boolean
    mfa_enabled?: boolean
    verified: boolean,
    email: string,
    flags: number,
    banner: string,
    locale?: string
    accent_color?: number,
    premium_type?: number,
    public_flags?: number
}