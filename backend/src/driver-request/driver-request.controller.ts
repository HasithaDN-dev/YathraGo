import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DriverRequestService } from './driver-request.service';
import { CreateRequestDto, CounterOfferDto, RespondRequestDto } from './dto';

@Controller('driver-request')
export class DriverRequestController {
  constructor(private readonly driverRequestService: DriverRequestService) {}

  /**
   * Create new ride request
   * POST /driver-request/create
   */
  @Post('create')
  async createRequest(@Body() dto: CreateRequestDto) {
    return this.driverRequestService.createRequest(dto);
  }

  /**
   * Get customer's requests
   * GET /driver-request/customer/:customerId
   */
  @Get('customer/:customerId')
  async getCustomerRequests(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('status') status?: string,
  ) {
    return this.driverRequestService.getCustomerRequests(
      customerId,
      status as any,
    );
  }

  /**
   * Get driver's requests
   * GET /driver-request/driver/:driverId
   */
  @Get('driver/:driverId')
  async getDriverRequests(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('status') status?: string,
  ) {
    return this.driverRequestService.getDriverRequests(driverId, status as any);
  }

  /**
   * Customer counter offer
   * POST /driver-request/:id/counter-offer
   */
  @Post(':id/counter-offer')
  async customerCounterOffer(
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: CounterOfferDto,
    @Body('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.driverRequestService.customerCounterOffer(
      requestId,
      dto,
      customerId,
    );
  }

  /**
   * Driver respond to request
   * POST /driver-request/:id/respond
   */
  @Post(':id/respond')
  async driverRespond(
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: RespondRequestDto,
    @Body('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.driverRequestService.driverRespond(requestId, dto, driverId);
  }

  /**
   * Accept current offer
   * POST /driver-request/:id/accept
   */
  @Post(':id/accept')
  async acceptRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('userType') userType: 'customer' | 'driver',
  ) {
    return this.driverRequestService.acceptRequest(requestId, userId, userType);
  }

  /**
   * Reject request
   * POST /driver-request/:id/reject
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('userType') userType: 'customer' | 'driver',
    @Body('reason') reason?: string,
  ) {
    await this.driverRequestService.rejectRequest(
      requestId,
      userId,
      userType,
      reason,
    );
  }

  /**
   * Assign accepted request to ride table
   * POST /driver-request/:id/assign
   */
  @Post(':id/assign')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignRequest(@Param('id', ParseIntPipe) requestId: number) {
    await this.driverRequestService.assignRequest(requestId);
  }
}
