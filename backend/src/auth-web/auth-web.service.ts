import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthWebDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthWebService {
    constructor(private prisma:PrismaService){}

    async singup(creadentials:AuthWebDto){
        const hashPassword = await argon.hash(creadentials.password);

        //create a user in the DB
        const user = await this.prisma.user.create({
            data:{
                email:creadentials.email,
                password:hashPassword,
                firstName:creadentials.firstName,
                lastName:creadentials.lastName,
                role:creadentials.role
            },
        });

        return user;

       // return('siging up')
    }

    async login(creadentials:AuthWebDto){}

}
