# YathraGo Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

YathraGo is a comprehensive transport management system backend built with modern web technologies. This backend API serves the YathraGo mobile and web applications, providing secure authentication, real-time communication, and robust data management for transport operations.

## Technologies Used

### Core Framework
- **NestJS** - A progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript** - Strongly typed programming language that builds on JavaScript
- **Node.js** - JavaScript runtime environment

### Database & ORM
- **PostgreSQL** - Advanced open-source relational database
- **Prisma ORM** - Next-generation ORM for Node.js and TypeScript
  - Type-safe database client
  - Database migrations
  - Database introspection
  - Query builder with IntelliSense

### Authentication & Security
- **JWT (JSON Web Tokens)** - Secure token-based authentication
- **Passport.js** - Authentication middleware for Node.js
- **Argon2** - Secure password hashing algorithm

### Communication & Notifications
- **Android SMS Gateway** - SMS sending service integration

### File Handling & HTTP
- **Multer** - Node.js middleware for handling multipart/form-data (file uploads)
- **Axios** - Promise-based HTTP client for making API requests

### Development & Testing
- **Jest** - JavaScript testing framework
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **SWC** - Fast TypeScript/JavaScript compiler

### Additional Utilities
- **UUID** - Unique identifier generation
- **RxJS** - Reactive extensions for JavaScript
- **js-cookie** - Cookie handling utilities

## Architecture Features

### Modular Structure
- **User Management** - Customer, driver, and owner authentication
- **Vehicle Management** - Vehicle registration and tracking
- **Authentication Module** - Secure login and registration
- **Prisma Module** - Database connection and operations
- **Common Module** - Shared utilities and middleware

### Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password storage with Argon2
- OTP-based phone verification

### Database Design
- Relational database structure with PostgreSQL
- Type-safe queries with Prisma
- Automated migrations
- Data integrity constraints

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Twilio account (for SMS functionality)

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/yathrago"
DIRECT_URL="postgresql://username:password@localhost:5432/yathrago"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Other configurations
PORT=3000
```

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 3. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

## Database Management

### Prisma Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Pull schema from existing database
npx prisma db pull

# Push schema changes without migrations
npx prisma db push
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-phone` - Phone verification
- `POST /auth/send-otp` - Send OTP
- `POST /auth/refresh` - Refresh JWT token

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/upload-avatar` - Upload profile picture

### Customer Operations
- `GET /customer/vehicles` - Get available vehicles
- `POST /customer/booking` - Create booking
- `GET /customer/bookings` - Get user bookings

### Driver Operations
- `GET /driver/profile` - Get driver profile
- `PUT /driver/status` - Update driver status
- `GET /driver/bookings` - Get driver bookings

### Vehicle Management
- `POST /vehicle/register` - Register vehicle
- `GET /vehicle/list` - Get vehicles
- `PUT /vehicle/update` - Update vehicle details

## Project Structure

```
src/
├── auth/              # Authentication module
├── common/            # Shared utilities and middleware
├── customer/          # Customer-specific operations
├── driver/            # Driver-specific operations
├── owner/             # Vehicle owner operations
├── prisma/            # Prisma service and configuration
├── user/              # User management
├── vehicle/           # Vehicle management
├── app.controller.ts  # Main app controller
├── app.module.ts      # Root module
├── app.service.ts     # Main app service
└── main.ts            # Application entry point
```

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **User** - Base user information
- **Customer** - Customer-specific data
- **Driver** - Driver profiles and status
- **Owner** - Vehicle owner information
- **Vehicle** - Vehicle details and specifications
- **Booking** - Ride booking information
- **OtpCode** - OTP verification codes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Deployment

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:

- Database connection strings
- JWT secrets
- Twilio credentials
- Any other service API keys

### Build for Production

```bash
npm run build
npm run start:prod
```

## Support

For questions and support regarding the YathraGo backend:

1. Check the API documentation at `/api` endpoint
2. Review the codebase documentation
3. Contact the development team

## License

This project is proprietary software. All rights reserved.