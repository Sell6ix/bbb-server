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
cp .env.example .env        # then set JWT_SECRET (openssl rand -base64 48)
npx prisma generate
npx prisma migrate deploy   # creates prisma/dev.db
npm run start:dev
```

The API listens on `http://localhost:3000`. The SQLite database is `prisma/dev.db` and is not tracked in Git.

| Variable | Description |
|---|---|
| `JWT_SECRET` | **Required.** Secret used to sign JWTs; the server refuses to start without it |
| `ALLOW_REGISTRATION` | Let `/auth/login` create an account for an unknown username. Defaults to `true` outside production and `false` when `NODE_ENV=production` |

With registration disabled there is no endpoint for creating users yet, so create the first accounts while it is enabled.

Run the client from [bbb-client](https://github.com/Sell6ix/bbb-client) to get a UI.

```bash
npm test          # unit tests
npm run build
```

## Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | public | Returns a JWT. An unknown username is registered as a `BRO` only when registration is allowed |
| GET | `/users`, `/users/:username` | JWT | List users (optional `?role=`) or get one |
| GET | `/users/me` | JWT | Current user |
| GET | `/applications/mine` | JWT | Applications submitted by the current user |
| GET | `/applications/targeting/:username` | JWT | Applications about a given user |
| POST | `/applications` | JWT | Submit an application (`targetUser`, `type`) |
| GET | `/applications` | admin | All applications |
| PATCH | `/applications/:id/vote`, `/unvote` | admin | Vote for an application or withdraw the vote |
| DELETE | `/applications/:id` | JWT | Cancel an application |

## Status

This is a learning/demo project. Registration on first login is meant for local development; there is no separate sign-up endpoint, no rate limiting and no password policy yet, so do not expose it publicly as is.
