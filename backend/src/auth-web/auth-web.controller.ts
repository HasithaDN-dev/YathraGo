import { Body, Controller, Post } from '@nestjs/common';
import { AuthWebService } from './auth-web.service';
import { LoginDto, SignupDto } from './dto';

@Controller('auth-web')
export class AuthWebController {
    constructor(private authService:AuthWebService){}

    //signup route
    @Post('signup')
    signup(@Body() credentialsDto:SignupDto){
        return this.authService.signup(credentialsDto);
    }

    //login route
    @Post('login')
    login(@Body() credentialsDto:LoginDto){
        return this.authService.login(credentialsDto);
    }
}
