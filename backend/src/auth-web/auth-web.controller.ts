import { Body, Controller, Post } from '@nestjs/common';
import { AuthWebService } from './auth-web.service';
import { AuthWebDto } from './dto';

@Controller('auth-web')
export class AuthWebController {
    constructor(private authService:AuthWebService){}

    //signup route
    @Post('signup')
    signup(@Body() credentialsDto:AuthWebDto){
        return this.authService.singup(credentialsDto);
    }

    //login route
    @Post('login')
    login(@Body() credentialsDto:AuthWebDto){
        return this.authService.login(credentialsDto);
    }
}
