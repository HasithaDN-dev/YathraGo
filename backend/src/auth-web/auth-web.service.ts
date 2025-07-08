import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {  LoginDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';

@Injectable()
export class AuthWebService {
    constructor(
        private prisma:PrismaService,
        private jwt:JwtService,
        private config:ConfigService
    ){}

    async signup(credentials:SignupDto){
        const hashPassword = await argon.hash(credentials.password);

        //create a user in the DB
        try {
            const user = await this.prisma.user.create({
            data:{
                email:credentials.email,
                password:hashPassword,
                username:credentials.username,
                role:credentials.role
                },
            });

            return this.signToken(user.id, user.email);

        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
        }
        

       // return('siging up')
    }

    async login(credentials:LoginDto){

        //find the user by email
        const user =  await this.prisma.user.findUnique({
            where:{
                email:credentials.email
            },
        });

        if(!user){
            throw new ForbiddenException('Credentials incorrect');
        }
        //campare password
        const passwordMatches = await argon.verify(user.password, credentials.password)
        if(!passwordMatches){
            throw new ForbiddenException('Credentials incorrect');
        };

     
        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId:number,
        email:string,
    ): Promise<{access_token:string}> {
        const payload = {
            sub:userId,
            email,
        }

        const jwtSecret = this.config.get('WEB_JTW_SECRET');

        const token = await this.jwt.signAsync(payload,{
            expiresIn:'1h',
            secret:jwtSecret
        });

        return{
            access_token:token,
        }

      
    }

}
