import { CommandType } from "../interfaces/discord/Command";

export class Command {
    constructor(commandOptions: CommandType){
        Object.assign(this, commandOptions)
    }
}