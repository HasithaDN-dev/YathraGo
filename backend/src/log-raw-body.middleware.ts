import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('/customer/register-child')) {
      let rawBody = '';
      req.on('data', (chunk) => {
        rawBody += chunk;
      });
      req.on('end', () => {
        try {
          console.log('[RAW BODY] /customer/register-child:', rawBody);
        } catch (e) {
          console.log(
            '[RAW BODY] /customer/register-child: [unparsable]',
            rawBody,
          );
        }
        next();
      });
    } else {
      next();
    }
  }
}
