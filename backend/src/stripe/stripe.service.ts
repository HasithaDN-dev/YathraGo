import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    });

    this.logger.log('Stripe service initialized successfully');
  }

  /**
   * Create a payment intent for child monthly payment
   */
  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  }> {
    try {
      const { childId, customerId, paymentIds, totalAmount, description } = dto;

      // Validate payment records exist
      const payments = await this.prisma.childPayment.findMany({
        where: {
          id: { in: paymentIds },
          childId: childId,
          customerId: customerId,
        },
        include: {
          Child: {
            select: {
              childFirstName: true,
              childLastName: true,
            },
          },
        },
      });

      if (payments.length !== paymentIds.length) {
        throw new BadRequestException('Some payment records not found or do not belong to this customer');
      }

      // Check if any payment is already paid
      const alreadyPaid = payments.filter((p) => p.paymentStatus === 'PAID');
      if (alreadyPaid.length > 0) {
        throw new BadRequestException('Some selected months are already paid');
      }

      // Create Stripe Payment Intent
      const currency = this.configService.get<string>('STRIPE_CURRENCY') || 'lkr';
      
      // Stripe requires amount in smallest currency unit (cents for USD, paisa for LKR)
      // For LKR: 1 rupee = 100 paisa
      const amountInSmallestUnit = Math.round(totalAmount * 100);

      const childName = `${payments[0].Child.childFirstName} ${payments[0].Child.childLastName}`;
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency,
        description: description || `Payment for ${childName}`,
        metadata: {
          childId: childId.toString(),
          customerId: customerId.toString(),
          paymentIds: paymentIds.join(','),
          childName: childName,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id} for amount ${totalAmount} ${currency.toUpperCase()}`);

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        currency: currency.toUpperCase(),
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create payment intent: ' + error.message);
    }
  }

  /**
   * Confirm payment and update database
   */
  async confirmPayment(dto: ConfirmPaymentDto): Promise<{
    success: boolean;
    message: string;
    paidPaymentIds: number[];
  }> {
    try {
      const { paymentIntentId } = dto;

      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException(`Payment not completed. Status: ${paymentIntent.status}`);
      }

      // Extract metadata
      const { childId, customerId, paymentIds } = paymentIntent.metadata;
      const paymentIdArray = paymentIds.split(',').map((id) => parseInt(id));

      // Update payment records to PAID
      const updateResult = await this.prisma.childPayment.updateMany({
        where: {
          id: { in: paymentIdArray },
          childId: parseInt(childId),
          customerId: parseInt(customerId),
          paymentStatus: {
            notIn: ['PAID', 'CANCELLED'],
          },
        },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: 'CARD',
          transactionRef: paymentIntent.id,
          amountPaid: paymentIntent.amount / 100, // Convert back to rupees
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Payment confirmed: ${paymentIntent.id}, Updated ${updateResult.count} records`);

      return {
        success: true,
        message: `Successfully paid for ${updateResult.count} month(s)`,
        paidPaymentIds: paymentIdArray,
      };
    } catch (error) {
      this.logger.error('Error confirming payment:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to confirm payment: ' + error.message);
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    metadata: any;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error('Error retrieving payment intent:', error);
      throw new BadRequestException('Failed to retrieve payment status');
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      this.logger.log(`Payment intent cancelled: ${paymentIntent.id}`);

      return {
        success: true,
        message: 'Payment cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Error cancelling payment intent:', error);
      throw new BadRequestException('Failed to cancel payment');
    }
  }

  /**
   * Get publishable key for frontend
   */
  getPublishableKey(): string {
    return this.configService.get<string>('STRIPE_PUBLISHABLE_KEY') || '';
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(signature: string, payload: Buffer): Promise<any> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.warn('Webhook secret not configured, skipping signature verification');
      return;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      this.logger.log(`Webhook received: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  /**
   * Handle successful payment webhook
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    
    try {
      // Extract payment IDs from metadata
      const paymentIdsString = paymentIntent.metadata?.paymentIds;
      
      if (!paymentIdsString) {
        this.logger.warn(
          `No payment IDs found in metadata for payment intent: ${paymentIntent.id}`,
        );
        return;
      }

      const paymentIds: number[] = JSON.parse(paymentIdsString);
      this.logger.log(`Updating payment records: ${paymentIds.join(', ')}`);

      // Update all payment records to PAID status
      const updatedPayments = await this.prisma.childPayment.updateMany({
        where: {
          id: { in: paymentIds },
          paymentStatus: { not: 'PAID' }, // Only update if not already paid
        },
        data: {
          paymentStatus: 'PAID',
          amountPaid: paymentIntent.amount / 100, // Convert from smallest unit
          paymentMethod: 'CARD',
          transactionRef: paymentIntent.id,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Successfully updated ${updatedPayments.count} payment records to PAID for payment intent: ${paymentIntent.id}`,
      );

      // TODO: Send notification to customer about successful payment
      // TODO: Send notification to driver about payment received
      
    } catch (error) {
      this.logger.error(`Error handling payment success webhook:`, error);
      throw error;
    }
  }

  /**
   * Handle failed payment webhook
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.error(`Payment failed: ${paymentIntent.id}`);
    
    try {
      const paymentIdsString = paymentIntent.metadata?.paymentIds;
      
      if (!paymentIdsString) {
        this.logger.warn(
          `No payment IDs found in metadata for failed payment intent: ${paymentIntent.id}`,
        );
        return;
      }

      const paymentIds: number[] = JSON.parse(paymentIdsString);
      this.logger.log(`Payment failed for records: ${paymentIds.join(', ')}`);

      // Optionally update payment records to show failure
      // For now, we'll just log it. The records remain in their original state
      // so the customer can try again

      // TODO: Send notification to customer about payment failure
      
    } catch (error) {
      this.logger.error(`Error handling payment failed webhook:`, error);
    }
  }
}
