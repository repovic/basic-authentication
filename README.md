# JWT Basic Authentication

**Access / Refresh token Authentication with token reuse detection**, based on Browser / Network change. Built with **Apollo GraphQL**(Express) and **MongoDB**. Built as **EXAMPLE** / **BOILERPLATE**.

## Getting started:

1. step: Clone repository:

```
git clone https://github.com/repovic/basic-authentication
```

2. step: Install required NPM packages:

```
cd ./basic-authentication/server && npm install
```

3. step: Configure ENV variables, create ENV file in the following path:

```
/server/source/environment/.env.development
```

3. step: ENV Sample:

```
MONGODB_CONNECTION_STRING =

ACCESS_TOKEN_SECRET =
REFRESH_TOKEN_SECRET =

ACCESS_TOKEN_EXPIRE = 5s
REFRESH_TOKEN_EXPIRE = 7d

REFRESH_TOKEN_COOKIE_EXPIRE = 604800000
# 60 * 60 * 24 * 7 * 1000 - 7 days (ms)
```

4. step: Start the application:

```
npm run dev
```

4. step: Once started, Apollo Studio Explorer is live at: `http://localhost:5555/graphql`, by default.
