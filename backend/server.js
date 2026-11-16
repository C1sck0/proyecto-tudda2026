import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config.js';
import { configureRouter } from './api/router.js';
import './dependencies.js';
import errorMiddleware from './middlewares/errors_middleware.js';
import checkAuthorizationTokenMiddleware from './middlewares/check_authorization_token_middleware.js';
import logMiddleware from './middlewares/log_middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(checkAuthorizationTokenMiddleware);
app.use(logMiddleware);

const apiRouter = express.Router();
app.use('/api', apiRouter);
configureRouter(apiRouter);

app.use(errorMiddleware);

try {
    await mongoose.connect(config.dbConnection);
    console.log('Conectadp a MongoDB');

    app.listen(config, () => {
        console.log(`Server is running on http://localhost:${config.port}`);
    });
} catch (error) {
    console.error('Error connecting to MongoDB:', error);
}