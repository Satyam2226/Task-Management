import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Please add your MONGODB_URI in the Secrets panel to use this feature.',
      code: 'DB_DISCONNECTED'
    });
  }
  next();
};
