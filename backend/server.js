import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import config from './config.js';
import { configureRouter } from './api/router.js';
import './dependencies.js';
import errorMiddleware from './middlewares/error_middleware.js';
import checkAuthorizationTokenMiddleware from './middlewares/check_authorization_token_middleware.js';
import logMiddleware from './middlewares/log_middleware.js';
//import bcrypt from 'bcrypt';

//console.log('Hash de 1234:', await bcrypt.hash('1234', 10));

try {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(logMiddleware);
  app.use(checkAuthorizationTokenMiddleware);

  const apiRouter = express.Router();
  app.use('/api', apiRouter);
  configureRouter(apiRouter);

  app.use(errorMiddleware);

  await mongoose.connect(config.dbConnection);
  console.log('Conectado a MongoDB');

  app.listen(config.port, () => {
    console.log(`Server escuchando en http://localhost:${config.port}`);
  });
} catch (error) {
  console.error('Error initianing the server:', error);
}
