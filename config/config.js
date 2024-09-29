module.exports = {
  jwtExpiration: "1d",
  jwtRefreshExpiration: "7d",
  db: {
    host: "localhost",
    database: "nexmedissocmed",
    username: "postgres",
    password: "postgres",
    dialect: "postgres",
    options: {
      logging: false,
    },
  },
};
