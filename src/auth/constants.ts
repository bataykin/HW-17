export const jwtConstants =
  process.env.NODE_ENV == "DEV" || process.env.NODE_ENV == undefined
    ? {
        secret: "123",
        accessTokenExpiresIn: 1000000,
        refreshTokenExpiresIn: 200000,
        cookieSecure: false,
        httpOnly: false,
      }
    : {
        secret: "123",
        accessTokenExpiresIn: 10,
        refreshTokenExpiresIn: 20,
        cookieSecure: true,
        httpOnly: true,
      };
