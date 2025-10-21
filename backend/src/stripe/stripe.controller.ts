import { Controller, Post, Get, Body, Param, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  @UseGuards(AuthGuard('jwt'))
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(dto);
  }

  @Post('confirm-payment')
  @UseGuards(AuthGuard('jwt'))
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.stripeService.confirmPayment(dto);
  }

  @Get('payment-status/:paymentIntentId')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentStatus(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.getPaymentIntentStatus(paymentIntentId);
  }

  @Post('cancel-payment/:paymentIntentId')
  @UseGuards(AuthGuard('jwt'))
  async cancelPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.cancelPaymentIntent(paymentIntentId);
  }

  @Get('publishable-key')
  getPublishableKey() {
    return {
      publishableKey: this.stripeService.getPublishableKey(),
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const payload = req.rawBody;
    if (!payload) {
      throw new Error('Missing request body for webhook');
    }
    return this.stripeService.handleWebhook(signature, payload);
  }
}
