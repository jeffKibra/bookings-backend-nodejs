import { Request, Response, NextFunction } from 'express';
import { GraphQLError } from 'graphql';

//
import formatError from './formatError';

export default function errorHandler(
  err: GraphQLError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = formatError(err);
  const { message, locations, path } = error;

  let statusCode = 500;
  let errorType = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'Internal server error. Please try again later.';

  //   if (extensions && extensions.exception) {
  //     const { name } = extensions.exception;

  //     if (name === 'ValidationError') {
  //       statusCode = 400;
  //       errorType = 'VALIDATION_ERROR';
  //       errorMessage =
  //         'Invalid input. Please provide valid data for the following fields:';
  //     }
  //   }

  const response = {
    errorType,
    message: errorMessage,
    locations,
    path,
  };

  res.status(statusCode).json(response);
}
