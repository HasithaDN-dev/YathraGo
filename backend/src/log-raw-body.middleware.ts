import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('/customer/register-child')) {
      // Log the parsed body, not the raw stream
      console.log('[BODY] /customer/register-child:', req.body);
    }
    next();
  }
}
