# (WIP) Bot


[![Deploy Bot](https://github.com/Stormix/bot/actions/workflows/deploy.yml/badge.svg)](https://github.com/Stormix/bot/actions/workflows/deploy.yml)

A multipurpose twitch/discord bot written in TypeScript. This project is a monorepo, which contains the following packages:

- [bot](./packages/bot) - The main bot package
- [language](./packages/language) - A simple interpreted dynamic programming language for describing chat bot commands and behavior based of [Bex](https://gitlab.com/tsoding/bex) but in TypeScript.


## Stack

Very opinionated stack, but it works for me.

- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [MongoDB](https://www.mongodb.com/)
- [Lerna](https://lerna.js.org/)
- [Docker](https://www.docker.com/)

## Features / ToDo:

Check the [.todo](./.todo) file for the current feature set.

## Skills
### Conversational

Bot uses an AI model to respond to messages in chat and discord DMs. The model is based of [GODEL](https://github.com/microsoft/GODEL) and will be trained on my own dataset in the future.


## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Pnpm](https://pnpm.io/)

### Setup

```bash
git clone https://github.com/Stormix/bot.git
cd bot
pnpm install
cp .env.example .env # and fill in the values
```

### Environment Variables

| Name | Description|
|---|---|
|`ENABLED` |	Determines if the bot is enabled or not |
|`SENTRY_DSN` |	Sentry.io DSN used for error logging and monitoring |
|`NODE_ENV` |	Environment mode for Node.js (e.g. development, testing) |
|`TWITCH_CLIENT_ID` |	Twitch API client ID used for accessing Twitch API |
|`TWITCH_ACCESS_TOKEN` |	Twitch API access token used for authentication |
|`TWITCH_REFRESH_TOKEN` |	Twitch API refresh token used for token refresh |
|`TWITCH_USERNAME` |	Twitch account username for the bot |
|`DISCORD_TOKEN` |	Discord API token used for authentication |
|`DISCORD_GUILD_ID` |	Discord server/guild ID where the bot is installed |
|`DISCORD_OWNER_ID` |	Discord user ID of the bot owner |
|`DATABASE_URL` |	URL of the database used for the bot |
|`PORT` | API listening port |
|`REDIS_PORT` | Redis port |
|`REDIS_HOST` | Redis host |
|`REDIS_PASSWORD` | Redis password |
|`REDIS_USERNAME` | Redis username |


## Docker

### Build

```bash
  set DOCKER_BUILDKIT=1 && docker buildx build  --progress=plain -t bot --no-cache .
```
```bash
docker run -dp 3000:3000 bot
```
## Issues

If you come across any issues please [report them here](https://github.com/Stormix/bot/issues).

## Contributing

Thank you for considering contributing to this project! Please feel free to make any pull requests, or e-mail me a feature request you would like to see in the future to hello@stormix.co.

## Security Vulnerabilities

If you discover a security vulnerability within this project, please send an e-mail to hello@stormix.co, or create a pull request if possible. All security vulnerabilities will be promptly addressed.