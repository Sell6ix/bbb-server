# Bro Brings Buddy — API server

REST API for Bro Brings Buddy, a small community app where people apply for membership or admin rights and existing admins vote on the applications. It handles authentication, roles and the voting rules; the UI lives in [bbb-client](https://github.com/Sell6ix/bbb-client).

![Admin panel of bbb-client showing an application waiting for votes](docs/screenshots/admin.png)

## How it works

- Users have one of three roles: `BRO` (default), `MEMBER` or `ADMIN`.
- A `MEMBER` application is approved after votes from **2 admins**; the candidate is promoted to `MEMBER`.
- An `ADMIN` application needs votes from **all current admins**; the candidate is promoted to `ADMIN`.
- Statuses: `PENDING`, `WAITING_VOTES`, `WAITING_UNANIMOUS`, `APPROVED`, `DELETED`.

## Tech stack

- [NestJS](https://nestjs.com/) 11 and TypeScript
- [Prisma](https://www.prisma.io/) 6 with SQLite
- Passport JWT and bcryptjs for authentication
- Jest for tests

## Run locally

Requirements: Node.js and npm.

```bash
npm ci
npx prisma generate
npm run start:dev
```

The API listens on `http://localhost:3000`. The SQLite database is `prisma/dev.db`. To start with an empty database, delete that file and run `npx prisma migrate deploy`.

Run the client from [bbb-client](https://github.com/Sell6ix/bbb-client) to get a UI.

```bash
npm test          # unit tests
npm run build
```

## Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | public | Returns a JWT. An unknown username is registered as a `BRO` |
| GET | `/users`, `/users/:username` | public | List users (optional `?role=`) or get one |
| GET | `/users/me` | JWT | Current user |
| GET | `/applications/mine` | JWT | Applications submitted by the current user |
| GET | `/applications/targeting/:username` | JWT | Applications about a given user |
| POST | `/applications` | JWT | Submit an application (`targetUser`, `type`) |
| GET | `/applications` | admin | All applications |
| PATCH | `/applications/:id/vote`, `/unvote` | admin | Vote for an application or withdraw the vote |
| DELETE | `/applications/:id` | JWT | Cancel an application |

## Status

This is a learning/demo project and is not production-ready: the JWT secret is hardcoded in `src/auth` and `/auth/login` creates accounts on first use. Move the secret to an environment variable before deploying anywhere public.
