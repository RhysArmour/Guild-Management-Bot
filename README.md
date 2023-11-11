## Description:

- Discord Bot for handling my discord needs

## Instructions

LEFT OFF READING MORE IN DEPTH ON SLASH COMMANDS AT: https://discordjs.guide/interactions/registering-slash-commands.html#guild-commands THE GOAL IS TO LEARN MORE ABOUT INTERACTING AND IMPLEMENTING SLASH COMMANDS BEFORE MOVING ON.

## Start Docker

docker run --name dev-guild-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=dev -p 5432:5432 postgres


## Connect To Local DB

- psql -h 127.0.0.1 -p 5432 -U postgres dev
- password: admin
