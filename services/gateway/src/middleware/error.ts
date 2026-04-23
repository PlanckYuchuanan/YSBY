import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      data: null
    });
  }

  // Unknown error
  return res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
};