import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    signup() {
        return {msg: 'I am a signuped'};
    }

    signin() {
        return {msg: 'I am a signining'};
    }
}