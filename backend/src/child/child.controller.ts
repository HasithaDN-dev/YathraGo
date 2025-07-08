import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { RegisterChildDto } from './dto/register-child.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Controller('child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('childImage', {
      storage: diskStorage({
        destination: './uploads/children',
        filename: (req, file, cb) => {
          const uniqueName = uuidv4() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: RegisterChildDto,
  ) {
    return this.childService.register(dto, file?.filename);
  }

  @Post('link/:childId/:staffPassengerId')
  async linkChildToStaff(
    @Param('childId', ParseIntPipe) childId: number,
    @Param('staffPassengerId', ParseIntPipe) staffPassengerId: number,
  ) {
    return this.childService.linkChildToStaff(childId, staffPassengerId);
  }
}

/*
testing 
{
  "name": "Staff Name",
  "email": "staff@email.com",
  "contact": "123456789",
  "nearbyCity": "Colombo",
  "workLocation": "Office",
  "workAddress": "123 Main St",
  "pickUpLocation": "Pickup Point",
  "pickupAddress": "456 Pickup St"
}


 Register Child
POST http://localhost:3000/child/register
Body: Form-data with all fields from RegisterChildDto and a file for childImage (optional).
c. Link Child to Staff Passenger Later
POST http://localhost:3000/child/link/1/2
(where 1 is child_id, 2 is staff_id)
🚦 10. Summary
Flexible creation: Staff and children can be created independently.
Linking: Children can be linked to staff later.
Validation: All fields are validated with clear messages.
File upload: Child images are saved with unique names.
Exception handling: Duplicate emails, missing fields, etc., are handled with clear errors.
Testing: All endpoints can be tested with Postman.



*/
