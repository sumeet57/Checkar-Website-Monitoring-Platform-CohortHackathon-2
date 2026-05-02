// this is env.js file to load environment variables from .env, development.env, production.env files
import dotenv from "dotenv";
import path from "path";

const envpath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envpath });

const devEnvPath = path.resolve(process.cwd(), "development.env");
const prodEnvPath = path.resolve(process.cwd(), "production.env");

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: devEnvPath });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: prodEnvPath });
}

const loadedEnvFile =
  process.env.NODE_ENV === "development" ? devEnvPath : prodEnvPath;
console.log(
  `ENV loaded from: ${loadedEnvFile} (${process.env.NODE_ENV || "default"})`,
);

export default {
  NODE: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_URI: process.env.DB_URI,
  clientUrl: process.env.CLIENT,
  SESSION_SECRET: process.env.SESSION_SECRET,
};
