import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComplaintsInquiriesService } from './complaints-inquiries.service';
import { CreateComplaintInquiryDto, UpdateComplaintInquiryDto } from './dto';
import {
  UserTypes,
  ComplaintStatus,
  ComplaintInquiryTypes,
  ComplaintInquiryCategory,
} from '@prisma/client';

@Controller('complaints-inquiries')
export class ComplaintsInquiriesController {
  constructor(
    private readonly complaintsInquiriesService: ComplaintsInquiriesService,
  ) {}

  /**
   * Create a new complaint or inquiry
   * POST /complaints-inquiries
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createComplaintInquiryDto: CreateComplaintInquiryDto,
  ) {
    return this.complaintsInquiriesService.create(createComplaintInquiryDto);
  }

  /**
   * Get all complaints/inquiries with optional filters
   * GET /complaints-inquiries
   */
  @Get()
  findAll(
    @Query('status') status?: ComplaintStatus,
    @Query('type') type?: ComplaintInquiryTypes,
    @Query('category') category?: ComplaintInquiryCategory,
  ) {
    return this.complaintsInquiriesService.findAll(status, type, category);
  }

  /**
   * Get statistics for complaints/inquiries
   * GET /complaints-inquiries/statistics
   */
  @Get('statistics')
  getStatistics() {
    return this.complaintsInquiriesService.getStatistics();
  }

  /**
   * Get all complaints/inquiries by sender
   * GET /complaints-inquiries/sender/:senderId?senderUserType=CUSTOMER
   */
  @Get('sender/:senderId')
  findBySender(
    @Param('senderId', ParseIntPipe) senderId: number,
    @Query('senderUserType', new ParseEnumPipe(UserTypes))
    senderUserType: UserTypes,
  ) {
    return this.complaintsInquiriesService.findBySender(
      senderId,
      senderUserType,
    );
  }

  /**
   * Get a single complaint/inquiry by ID
   * GET /complaints-inquiries/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsInquiriesService.findOne(id);
  }

  /**
   * Update complaint/inquiry status
   * PATCH /complaints-inquiries/:id
   */
  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateComplaintInquiryDto: UpdateComplaintInquiryDto,
  ) {
    return this.complaintsInquiriesService.updateStatus(
      id,
      updateComplaintInquiryDto,
    );
  }

  /**
   * Delete a complaint/inquiry
   * DELETE /complaints-inquiries/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsInquiriesService.delete(id);
  }
}
