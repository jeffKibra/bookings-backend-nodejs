import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
//
dotenv.config();
//
import { connect } from './db';
import {
  graphqlMiddleware,
  createGraphQLContextMiddleware,
} from './middlewares';
//
//
const PORT = process.env.PORT;
//
const app = express();

//================================================================

//cors settings
app.use(cors());
//check authentication for request before proceeding
app.use('/', createGraphQLContextMiddleware);

app.use('/graphql', graphqlMiddleware);

//custom error handler
app.use(
  (
    err: Record<string, unknown>,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const message = err?.message as string;
    const errorCode = err?.code as string;
    console.log('error handling middleware', { message, err });

    if (message) {
      // const errStatus = err?.code as number;
      const statusCode = typeof errorCode === 'number' ? errorCode : 500;

      res.status(statusCode).json({ message, code: errorCode || statusCode });
    } else {
      //cal default express error handler
      next(err);
    }
  }
);

//================================================================

app.listen(PORT, () => {
  connect();
  console.log(`Listening on port ${PORT}`);
});
