import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerConfigVehicle = {
  storage: diskStorage({
    destination: join(__dirname, '../../../uploads/vehicle'), // make sure this folder exists
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
};
