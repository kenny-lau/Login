# Login

## NodeJS: Simple login with jsonwebtoken backend

A simple NodeJS of a login system backend, it featured registration, login, retrieve account profile,
update profile and delete account. Bearer token is used to pass to the endpoint to validate before
execute any system functions.

It also have a refresh token to renew token on the background. It helps to maintain access token to
validate a period of time for security. Eventually, the refresh token will expire too. If that is the
case, user will need to login again.

## Nodes
1. MongoDB is the backend storage.
