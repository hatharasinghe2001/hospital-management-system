const morgan = require("morgan");
const { nodeEnv } = require("../config/env");

const loggerMiddleware = morgan(nodeEnv === "development" ? "dev" : "combined");

module.exports = loggerMiddleware;
