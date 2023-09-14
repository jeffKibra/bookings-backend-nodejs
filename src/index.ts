import express from 'express';
import dotenv from 'dotenv';
//
import { graphqlMiddleware, checkAuthMiddleware } from './middlewares';
import { connect } from './db';
//
dotenv.config();
//
const PORT = process.env.PORT;
//
const app = express();

//================================================================

//check authentication for request before proceeding
app.use('/', checkAuthMiddleware);

app.use('/graphql', graphqlMiddleware);

//================================================================

app.listen(PORT, () => {
  connect();
  console.log(`Listening on port ${PORT}`);
});
