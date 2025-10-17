import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfigVehicle = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const dest = join(__dirname, '../../../uploads/vehicle');
      if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
};

export const multerConfigDriver = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const dest = join(__dirname, '../../../uploads/driver');
      if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
};
