/* istanbul ignore file */

import dotenv from 'dotenv';

dotenv.config();

const config = {
  version: process.env.VERSION,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongodb: process.env.MONGO_URL,
  mongodbci: process.env.MONGO_CI_URL,
  mongodbremote: process.env.MONGO_REMOTE_URL,
  dbName: process.env.MONGO_DATABASE,
  jwtSecret: process.env.JWT_SECRET,
  sendgridAPIKey: process.env.SENDGRID_API_KEY,
};

export {config};
