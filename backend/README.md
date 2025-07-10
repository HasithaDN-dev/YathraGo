# Testing the Registration and Authentication Flow (Postman Guide)

This section provides step-by-step instructions to test the OTP, staff passenger registration, and child registration flows using Postman.

## 1. Send OTP

**Endpoint:** `POST /customer/auth/get-started/send-otp`


**Request Body:**
```json
{
  "phone": "+94712345678",
  "userType": "CUSTOMER"
}
```

**Instructions:**
1. Open Postman and create a new POST request to `http://localhost:3000/customer/auth/get-started/send-otp`.
2. In the Body tab, select `raw` and `JSON`, then paste the above JSON.
3. Click `Send`.
4. You should receive a response like:
   ```json
   {
     "message": "OTP sent successfully. Please check your phone.",
     "isNewUser": true
   }
   ```

## 2. Verify OTP

**Endpoint:** `POST /customer/auth/get-started/verify-otp`


**Request Body:**
```json
{
  "phone": "+94712345678",
  "otp": "123456",
  "userType": "CUSTOMER"
}
```

**Instructions:**
1. Use the OTP you received (or check the database if in testing mode).
2. Create a new POST request to `http://localhost:3000/customer/auth/get-started/verify-otp`.
3. In the Body tab, select `raw` and `JSON`, then paste the above JSON.
4. Click `Send`.
5. You will receive a response like:
   ```json
   {
     "accessToken": "<JWT_TOKEN>",
     "user": {
       "id": 1,
       "phone": "+94712345678",
       "userType": "CUSTOMER",
       "isVerified": true,
       "isNewUser": true,
       "registrationStatus": "OTP_VERIFIED"
     }
   }
   ```
6. Copy the `accessToken` and `user.id` (this is your `customerId`).

## 3. Register as Staff Passenger

**Endpoint:** `POST /customer/register-staff-passenger`

**Headers:**
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: application/json`

**Request Body Example:**
```json
{
  "customerId": 1,
  "nearbyCity": "Colombo",
  "workLocation": "Company HQ",
  "workAddress": "123 Main St",
  "pickUpLocation": "Bus Stop",
  "pickupAddress": "456 Side St",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "address": "789 Home Ave",
  "profileImageUrl": "https://example.com/profile.jpg",
  "emergencyContact": "+94712345678"
}
```

**Instructions:**
1. Create a new POST request to `http://localhost:3000/customer/register-staff-passenger`.
2. In the Headers tab, add your `Authorization` header with the value `Bearer <accessToken>`.
3. In the Body tab, select `raw` and `JSON`, then paste the above JSON (replace `customerId` and other fields as needed).
4. Click `Send`.
5. You should receive a response like:
   ```json
   { "success": true, "message": "Staff passenger registered." }
   ```

## 4. Register a Child

**Endpoint:** `POST /customer/register-child`

**Headers:**
  - `Authorization: Bearer <accessToken>`
  - `Content-Type: application/json`

**Request Body Example:**
```json
{
  "customerId": 1,
  "childName": "Jane Doe",
  "relationship": "Daughter",
  "NearbyCity": "Colombo",
  "schoolLocation": "Colombo 7",
  "school": "Royal College",
  "pickUpAddress": "123 School Lane",
  "childImageUrl": "https://example.com/child.jpg",
  "parentImageUrl": "https://example.com/parent.jpg",
  "parentName": "John Doe",
  "parentEmail": "john.doe@example.com",
  "parentAddress": "789 Home Ave",
  "emergencyContact": "+94712345678"
}
```

**Instructions:**
1. Create a new POST request to `http://localhost:3000/customer/register-child`.
2. In the Headers tab, add your `Authorization` header with the value `Bearer <accessToken>`.
3. In the Body tab, select `raw` and `JSON`, then paste the above JSON (replace `customerId` and other fields as needed).
4. Click `Send`.
5. You should receive a response like:
   ```json
   { "success": true, "message": "Child registered." }
   ```

---

**Notes:**
- Always use the `accessToken` from OTP verification for all protected endpoints.
- Use the `id` from the `user` object as `customerId` in registration requests.
- If you get validation errors, check your request body matches the DTO fields and types.
- If you get 401 errors, check your Authorization header and token.
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## 📋 Documentation

- **[Mobile Authentication Guide](./GET_STARTED_FLOW.md)** - Complete guide for implementing the unified "Get Started" authentication flow in mobile apps


## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Generating Modules, Controllers, and Services

NestJS provides CLI commands to quickly scaffold modules, controllers, and services. These commands automatically create the necessary folders and files in the correct structure.

#### 1. Generate a Module

```bash
npx nest g module <module-name>
```
**Example:**
```bash
npx nest g module passenger
```
This will create a new folder `src/passenger/` (if it doesn't exist) and a file `passenger.module.ts` inside it.

#### 2. Generate a Controller

```bash
npx nest g controller <module-name>
```
**Example:**
```bash
npx nest g controller passenger
```
This will create `src/passenger/passenger.controller.ts`.

#### 3. Generate a Service

```bash
npx nest g service <module-name>
```
**Example:**
```bash
npx nest g service passenger
```
This will create `src/passenger/passenger.service.ts`.

You can repeat these commands for any feature/module you want to add. The CLI will generate the folder and files if they do not exist.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
