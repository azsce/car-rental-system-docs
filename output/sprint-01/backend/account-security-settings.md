# Feature: Account Security Settings - Backend

## Overview

Backend implementation for Account Security Settings providing centralized security management including password changes, email/phone updates with verification, session management, login history tracking, suspicious activity detection, account deactivation, and GDPR-compliant data exports. The implementation uses .NET 8+ with secure password hashing, email/SMS verification workflows, comprehensive audit logging, and background job processing for data exports.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-AM-012

## API Endpoints

All endpoints documented in frontend specification. Key backend responsibilities:

- Password change with bcrypt/Argon2 hashing
- Email verification token generation and validation
- SMS OTP generation and delivery
- Session management and termination
- Login history tracking and filtering
- Suspicious activity detection
- Account deactivation with grace period
- Data export generation and delivery
- Comprehensive audit logging

## Technology Stack

- **Backend Framework**: .NET 8+ with C#, ASP.NET Core Web API
- **Password Hashing**: BCrypt.Net or Argon2
- **Token Generation**: System.Security.Cryptography for secure tokens
- **SMS Service**: Twilio SDK or AWS SNS
- **Email Service**: SendGrid or AWS SES
- **Background Jobs**: Hangfire for data export processing
- **File Storage**: AWS S3 or Azure Blob Storage
- **Database**: Entity Framework Core with MySQL provider

## Implementation Notes

Refer to frontend specification for complete API endpoint details, request/response schemas, business logic requirements, and security considerations.

